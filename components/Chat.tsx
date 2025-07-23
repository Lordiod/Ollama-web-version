import { useState, FormEvent, useEffect, useRef } from 'react'
import { Message, ChatResponse, User, ChatSession, LoadChatsResponse } from '../types'

interface ChatProps {
  user: User
  onLogout: () => void
}

export default function Chat({ user, onLogout }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome! How can I help you today?' }
  ])
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true)
  const [savingChat, setSavingChat] = useState<boolean>(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const shouldScrollRef = useRef<boolean>(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [streamingMessage, setStreamingMessage] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  
  // Check if this is a fresh conversation (only welcome message)
  const isFreshConversation = messages.length === 1 && messages[0].role === 'assistant' && messages[0].content === 'Welcome! How can I help you today?'

  // Debounced save function to prevent multiple saves
  const debouncedSave = (messagesToSave?: Message[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(async () => {
      await saveChatToDatabase(messagesToSave)
    }, 300)
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      
      // Only scroll if user is near the bottom or if it's a new message
      if (isNearBottom || shouldScrollRef.current) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }

  // Only scroll when we specifically want to (new messages in current conversation)
  useEffect(() => {
    if (shouldScrollRef.current && !loadingHistory) {
      // Add a small delay to ensure the DOM has updated
      setTimeout(() => {
        scrollToBottom()
        shouldScrollRef.current = false
      }, 100)
    }
  }, [messages, loadingHistory])

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && streamingMessage) {
      setTimeout(() => scrollToBottom(), 50)
    }
  }, [streamingMessage, isStreaming])

  useEffect(() => {
    loadChatSessions()
  }, [user.id])

  const loadChatSessions = async () => {
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/chat/load?userId=${user.id}`)
      const data: LoadChatsResponse = await response.json()
      
      if (data.success && data.chats) {
        setChatSessions(data.chats)
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const saveChatToDatabase = async (messagesToSave?: Message[]) => {
    if (savingChat) return
    
    setSavingChat(true)
    try {
      const messagesToUse = messagesToSave || messages
      const response = await fetch('/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          messages: messagesToUse,
          userId: user.id
        }),
      })
      
      if (response.ok) {
        // Check if this is a new session that needs to be added to the sidebar
        const isNewSession = !chatSessions.find(session => session.id === currentSessionId)
        
        if (isNewSession) {
          // Refresh chat sessions to show the new chat in sidebar
          await loadChatSessions()
        }
      }
    } catch (error) {
      console.error('Error saving chat:', error)
    } finally {
      setSavingChat(false)
    }
  }

  const createNewChat = async () => {
    // Save current chat before creating new one if it has content
    if (messages.length > 1) {
      await saveChatToDatabase()
    }
    
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setCurrentSessionId(newSessionId)
    setMessages([{ role: 'assistant', content: 'Welcome! How can I help you today?' }])
    // Don't auto-scroll when creating new chat
    shouldScrollRef.current = false
  }

  const loadChatSession = async (session: ChatSession) => {
    // Save current chat before switching if it has content
    if (messages.length > 1) {
      await saveChatToDatabase()
    }
    
    setCurrentSessionId(session.id)
    setMessages(session.messages || [{ role: 'assistant', content: 'Welcome! How can I help you today?' }])
    // Don't scroll when loading a different session
    shouldScrollRef.current = false
  }

  const deleteChatSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    // Find the session to show its title in confirmation
    const sessionToDelete = chatSessions.find(session => session.id === sessionId)
    const sessionTitle = sessionToDelete?.title || 'this chat'
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${sessionTitle}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await fetch('/api/chat/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId: user.id
        }),
      })

      if (response.ok) {
        // Remove the session from the local state
        const updatedSessions = chatSessions.filter(session => session.id !== sessionId)
        setChatSessions(updatedSessions)
        
        // If we're deleting the current session, create a new one
        if (currentSessionId === sessionId) {
          await createNewChat()
        }
        
        // Reload chat sessions to ensure consistency with database
        await loadChatSessions()
      } else {
        console.error('Failed to delete chat session')
        alert('Failed to delete chat session. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting chat session:', error)
      alert('Error deleting chat session. Please try again.')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)
    setIsStreaming(false) // Don't start streaming until we get first chunk
    setStreamingMessage('')
    
    // Set flag to scroll after both user message and AI response
    shouldScrollRef.current = true

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: currentInput,
          messages: [...messages, userMessage], // Include full history + new user message
          sessionId: currentSessionId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Handle streaming response with artificial typing effect
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''
      let displayedLength = 0
      let hasStartedStreaming = false

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          
          // First chunk received - stop showing typing indicator and start streaming
          if (!hasStartedStreaming && chunk.length > 0) {
            hasStartedStreaming = true
            setLoading(false) // Hide typing indicator
            setIsStreaming(true) // Start showing streaming message
          }
          
          fullResponse += chunk
          
          // Implement typing effect by gradually showing more characters
          const typingSpeed = 8 // milliseconds per character (faster streaming)
          
          const animateTyping = () => {
            if (displayedLength < fullResponse.length) {
              displayedLength++
              setStreamingMessage(fullResponse.substring(0, displayedLength))
              setTimeout(() => scrollToBottom(), 10)
              setTimeout(animateTyping, typingSpeed)
            }
          }
          
          // Start typing animation if not already running
          if (displayedLength === fullResponse.length - chunk.length) {
            animateTyping()
          }
        }
      }

      // Wait for typing animation to complete before finishing
      const waitForTypingComplete = () => {
        if (displayedLength < fullResponse.length) {
          setTimeout(waitForTypingComplete, 50)
        } else {
          // When streaming is complete, add the final message
          setIsStreaming(false)
          setStreamingMessage('')
          
          const assistantMessage: Message = { role: 'assistant', content: fullResponse }
          const updatedMessages = [...messages, userMessage, assistantMessage]
          setMessages(updatedMessages)
          
          // Save the chat immediately after getting the response with the complete conversation
          debouncedSave(updatedMessages)
        }
      }
      
      waitForTypingComplete()
    } catch (error) {
      console.error('Chat error:', error)
      setLoading(false) // Make sure to hide typing indicator on error
      setIsStreaming(false)
      setStreamingMessage('')
      
      const errorMessage: Message = { 
        role: 'assistant', 
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again.` 
      }
      const updatedMessages = [...messages, userMessage, errorMessage]
      setMessages(updatedMessages)
      
      // Save the chat even if there was an error with the complete conversation
      debouncedSave(updatedMessages)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    // Save current chat before logging out if it has content
    if (messages.length > 1) {
      await saveChatToDatabase()
    }
    onLogout()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 shadow-lg ${sidebarCollapsed ? 'w-16' : 'w-80'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex justify-between items-center">
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-white">Chat History</h2>
                <p className="text-xs text-indigo-200">{chatSessions.length} conversations</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={createNewChat}
              className="w-full mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
            >
              New Chat
            </button>
          )}
        </div>
        
        {/* Chat Sessions List */}
        {!sidebarCollapsed && (
          <div className="overflow-y-auto h-full pb-20">
            {loadingHistory ? (
              <div className="p-4 text-center text-blue-600">Loading...</div>
            ) : (
              <div className="p-3 space-y-2">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadChatSession(session)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group border ${
                      currentSessionId === session.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md'
                        : 'hover:bg-gray-50 border-transparent hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 truncate mb-1">
                          {session.title || 'New Chat'}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                        <div className="text-xs text-gray-400">
                          {session.messages?.length || 0} messages
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteChatSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-700 transition-all duration-200 flex items-center justify-center"
                        title="Delete chat"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                {chatSessions.length === 0 && !loadingHistory && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500 mb-2">No conversations yet</p>
                    <p className="text-xs text-gray-400">Start chatting to see your history here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Ollama AI Assistant</h1>
                <p className="text-sm text-gray-500">Hello, {user.email.split('@')[0]}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {savingChat && (
                <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Saving...
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Content Area - Changes based on conversation state */}
        {isFreshConversation ? (
          /* Centered Welcome Screen for fresh conversations */
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white p-8">
            <div className="max-w-2xl w-full text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-3xl">AI</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Hello, {user.email.split('@')[0]}!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                How can I assist you today?
              </p>
              
              {/* Centered Input Form */}
              <form onSubmit={handleSubmit} className="w-full">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e as any)
                      }
                    }}
                    placeholder="Send a message..."
                    className="w-full px-6 py-4 pr-16 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-lg shadow-lg"
                    disabled={loading}
                    rows={1}
                    style={{ minHeight: '64px', maxHeight: '200px' }}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Suggestions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Explain quantum computing",
                    "Help me write an email",
                    "Solve a math problem",
                    "Plan my daily schedule"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(suggestion)
                        // Auto-focus the textarea after setting the suggestion
                        setTimeout(() => {
                          const textarea = document.querySelector('textarea')
                          if (textarea) textarea.focus()
                        }, 50)
                      }}
                      className="p-4 text-left border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 text-gray-700 hover:text-indigo-700 group"
                    >
                      <div className="flex items-center justify-between">
                        <span>{suggestion}</span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Normal Chat Interface for ongoing conversations */
          <>
            {/* Chat Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white scroll-smooth"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-gradient-to-br from-green-500 to-teal-600'
                    }`}>
                      <span className="text-white text-xs font-bold">
                        {message.role === 'user' ? 'U' : 'AI'}
                      </span>
                    </div>
                    
                    {/* Message Bubble */}
                    <div className="flex flex-col">
                      <div
                        className={`px-6 py-4 rounded-2xl shadow-lg ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <span className={`text-xs text-gray-500 mt-2 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator - shown while waiting for AI response */}
              {loading && !isStreaming && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div className="px-6 py-4 bg-white rounded-2xl shadow-lg border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Streaming Message */}
              {isStreaming && streamingMessage && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="px-6 py-4 rounded-2xl shadow-lg bg-white text-gray-800 border border-gray-200">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {streamingMessage}
                          <span className="inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 text-left">
                        AI Assistant
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Bottom Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="flex space-x-4 items-end">
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(e as any)
                        }
                      }}
                      placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      disabled={loading}
                      rows={1}
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
                
                {/* Status Bar */}
                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Session: {currentSessionId.split('_')[1]}</span>
                    <span>Messages: {messages.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Connected to Ollama</span>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
