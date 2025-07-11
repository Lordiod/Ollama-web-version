import { NextApiRequest, NextApiResponse } from 'next'
import { ChatResponse, OllamaRequest, OllamaResponse, Message } from '../../types'

interface ChatRequest extends NextApiRequest {
  body: {
    prompt: string
    messages?: Message[]
    sessionId?: string
  }
}

// In-memory storage for chat sessions (in production, use a database)
const chatSessions: Map<string, Message[]> = new Map()

export default async function handler(
  req: ChatRequest,
  res: NextApiResponse<ChatResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, messages = [], sessionId = 'default' } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  try {
    // Get or create chat session
    let chatHistory = chatSessions.get(sessionId) || []
    
    // Add user message to history
    const userMessage: Message = { role: 'user', content: prompt }
    chatHistory = [...chatHistory, userMessage]
    
    // Prepare messages for Ollama chat API
    // Keep the full conversation history for context
    const ollamaMessages = chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat'
    
    const ollamaRequest: OllamaRequest = {
      model: 'llama3.2:3b',
      messages: ollamaMessages,
      stream: false
    }

    console.log('Sending to Ollama chat:', { url: ollamaUrl, messageCount: ollamaMessages.length })

    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaRequest)
    })

    if (!response.ok) {
      throw new Error(`Ollama server error: ${response.status} ${response.statusText}`)
    }

    const result: OllamaResponse = await response.json()
    console.log('Ollama response:', result)
    
    if (!result.message?.content) {
      throw new Error('Empty response from Ollama')
    }
    
    // Add assistant response to history
    const assistantMessage: Message = { role: 'assistant', content: result.message.content }
    chatHistory = [...chatHistory, assistantMessage]
    
    // Save updated chat history
    chatSessions.set(sessionId, chatHistory)
    
    // Limit history to last 50 messages to prevent context overflow
    if (chatHistory.length > 50) {
      chatHistory = chatHistory.slice(-50)
      chatSessions.set(sessionId, chatHistory)
    }

    res.json({ 
      response: result.message.content,
      sessionId,
      messageCount: chatHistory.length
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: `Chat error: ${errorMessage}` })
  }
}
