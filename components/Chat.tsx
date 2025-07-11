import { useState, FormEvent, useEffect } from 'react'
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

  // Load chat history when component mounts
  useEffect(() => {
    loadChatSessions()
  }, [user.id])

  // Save chat after each message exchange
  useEffect(() => {
    // Only save if we have more than just the welcome message and we're not currently loading history
    if (messages.length > 1 && !loadingHistory) {
      saveChatToDatabase()
    }
  }, [messages.length, loadingHistory]) // Only depend on message count, not the entire messages array

  const loadChatSessions = async () => {
    setLoadingHistory(true)
    try {
      console.log('Loading chat sessions for user:', user.id)
      const response = await fetch(`/api/chat/load?userId=${user.id}`)
      const data: LoadChatsResponse = await response.json()
      
      console.log('Chat sessions response:', data)
      
      if (data.success && data.chats) {
        setChatSessions(data.chats)
        console.log('Loaded chat sessions:', data.chats.length)
        
        // Don't automatically load the latest chat - start with a fresh chat instead
        // Users can click on a chat session to load it
      } else {
        console.log('No chat sessions found or error:', data.error)
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const saveChatToDatabase = async () => {
    if (savingChat) return // Prevent multiple simultaneous saves
    
    setSavingChat(true)
    try {
      console.log('Saving chat session:', currentSessionId, 'with', messages.length, 'messages')
      const response = await fetch('/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          messages,
          userId: user.id
        }),
      })

      const result = await response.json()
      console.log('Save response:', result)

      if (response.ok) {
        console.log('Chat saved successfully')
        // Don't reload chat sessions after save to prevent loops
      } else {
        console.error('Failed to save chat:', result.error)
      }
    } catch (error) {
      console.error('Error saving chat:', error)
    } finally {
      setSavingChat(false)
    }
  }

  const refreshChatSessions = async () => {
    try {
      const response = await fetch(`/api/chat/load?userId=${user.id}`)
      const data: LoadChatsResponse = await response.json()
      
      if (data.success && data.chats) {
        setChatSessions(data.chats)
      }
    } catch (error) {
      console.error('Error refreshing chat sessions:', error)
    }
  }

  const createNewChat = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setCurrentSessionId(newSessionId)
    setMessages([{ role: 'assistant', content: 'Welcome! How can I help you today?' }])
  }

  const loadChatSession = (session: ChatSession) => {
    setCurrentSessionId(session.id)
    setMessages(session.messages || [{ role: 'assistant', content: 'Welcome! How can I help you today?' }])
  }

  const deleteChatSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent triggering loadChatSession
    
    try {
      console.log('Deleting chat session:', sessionId)
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

      const result = await response.json()
      console.log('Delete response:', result)

      if (response.ok) {
        console.log('Chat deleted successfully')
        
        // Remove from local state
        const updatedSessions = chatSessions.filter(session => session.id !== sessionId)
        setChatSessions(updatedSessions)
        
        // If we deleted the current session, create a new one
        if (currentSessionId === sessionId) {
          createNewChat()
        }
      } else {
        console.error('Failed to delete chat:', result.error)
      }
    } catch (error) {
      console.error('Error deleting chat session:', error)
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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: currentInput,
          messages: messages, // Send current messages for context
          sessionId: currentSessionId
        }),
      })

      const data: ChatResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      if (!data.response) {
        throw new Error('Received empty response from server')
      }

      const assistantMessage: Message = { role: 'assistant', content: data.response }
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage]
        
        // If this is the first real exchange (user + assistant), refresh the sessions list
        if (newMessages.length === 3) { // Welcome + User + Assistant
          setTimeout(() => refreshChatSessions(), 1000) // Refresh after a delay
        }
        
        return newMessages
      })
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = { 
        role: 'assistant', 
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again.` 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = async () => {
    const clearedMessages: Message[] = [{ role: 'assistant', content: 'Welcome! How can I help you today?' }]
    setMessages(clearedMessages)
    
    // Also clear server-side session and save cleared state
    try {
      await fetch('/api/chat/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: currentSessionId }),
      })
      
      // Save the cleared chat state to database
      await fetch('/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          messages: clearedMessages,
          userId: user.id
        }),
      })
    } catch (error) {
      console.error('Error clearing chat session:', error)
    }
  }

  const handleLogout = async () => {
    // Save the current chat before logging out
    if (messages.length > 1) {
      try {
        await saveChatToDatabase()
        console.log('Chat saved before logout')
      } catch (error) {
        console.error('Error saving chat before logout:', error)
      }
    }
    
    // Small delay to ensure save completes
    setTimeout(() => {
      onLogout()
    }, 500)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={createNewChat}
              className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              New Chat
            </button>
          )}
        </div>
        
        {!sidebarCollapsed && (
          <div className="overflow-y-auto h-full pb-20">
            {loadingHistory ? (
              <div className="p-4 text-center text-gray-500">
                Loading chat history...
              </div>
            ) : (
              <div className="p-2">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadChatSession(session)}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors group ${
                      currentSessionId === session.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-800 truncate">
                          {session.title || 'New Chat'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {session.messages?.length || 0} messages
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteChatSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-all"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                
                {chatSessions.length === 0 && !loadingHistory && (
                  <div className="p-4 text-center text-gray-500">
                    No chat history yet. Start a new conversation!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Ollama AI Assistant</h1>
              <p className="text-sm text-gray-600">Welcome, {user.email}</p>
            </div>
            <div className="flex items-center space-x-3">
              {savingChat && (
                <span className="text-xs text-blue-600">Saving...</span>
              )}
              <button
                onClick={clearChat}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Clear Chat
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-200 hover:bg-red-300 text-red-800 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col max-w-xs lg:max-w-md">
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
                <span className={`text-xs text-gray-500 mt-1 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
          <div className="mt-2 text-xs text-gray-500">
            Session ID: {currentSessionId} • Messages: {messages.length}
          </div>
        </div>
      </div>
    </div>
  )
}
