import { useState, FormEvent } from 'react'
import { Message, ChatResponse } from '../types'

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome! How can I help you today?' }
  ])
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [sessionId] = useState<string>(() => {
    // Generate a unique session ID for this chat session
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })

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
          sessionId: sessionId
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
      setMessages(prev => [...prev, assistantMessage])
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
    setMessages([{ role: 'assistant', content: 'Welcome! How can I help you today?' }])
    
    // Also clear server-side session
    try {
      await fetch('/api/chat/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
    } catch (error) {
      console.error('Error clearing chat session:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Ollama AI Assistant</h1>
          <button
            onClick={clearChat}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Clear Chat
          </button>
        </div>
        
        <div className="h-96 overflow-y-auto p-4 space-y-4">
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
        
        <div className="p-4 border-t border-gray-200">
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
            Session ID: {sessionId} • Messages: {messages.length}
          </div>
        </div>
      </div>
    </div>
  )
}
