import { NextApiRequest, NextApiResponse } from 'next'
import { ChatResponse, OllamaRequest, OllamaResponse, Message } from '../../types'

interface ChatRequest extends NextApiRequest {
  body: {
    prompt: string
    messages?: Message[]
    sessionId?: string
  }
}

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
    // Use the messages from the frontend (which includes loaded history) 
    // instead of relying on in-memory storage
    let chatHistory = messages || []
    
    // Add user message to history
    const userMessage: Message = { role: 'user', content: prompt }
    chatHistory = [...chatHistory, userMessage]
    
    // Prepare messages for Ollama chat API
    // Keep the full conversation history for context
    const ollamaMessages = chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
    
    // Filter out the welcome message if it's the only assistant message
    // to avoid confusing the AI with generic greetings
    const filteredMessages = ollamaMessages.filter((msg, index) => {
      if (msg.role === 'assistant' && msg.content === 'Welcome! How can I help you today?' && chatHistory.length <= 2) {
        return false
      }
      return true
    })
    
    // Ensure we have some context - if no messages after filtering, use original
    const messagesToSend = filteredMessages.length > 0 ? filteredMessages : ollamaMessages

    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat'
    
    const ollamaRequest: OllamaRequest = {
      model: 'llama3.2:3b',
      messages: messagesToSend,
      stream: true // Enable streaming
    }

    console.log('Sending to Ollama chat:', { 
      url: ollamaUrl, 
      totalMessages: chatHistory.length,
      sentMessages: messagesToSend.length,
      sessionId,
      streaming: true
    })

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

    // Set up streaming response
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    let fullResponse = ''
    
    if (response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(line => line.trim() !== '')
          
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line)
              if (parsed.message?.content) {
                const content = parsed.message.content
                fullResponse += content
                
                // Send each character individually for true streaming effect
                for (let i = 0; i < content.length; i++) {
                  res.write(content[i])
                  // Force flush after each character
                  const socket = (res as any).socket
                  if (socket && socket.flush) {
                    socket.flush()
                  }
                }
              }
              
              if (parsed.done) {
                // Streaming complete
                res.end()
                
                // Add assistant response to history
                const assistantMessage: Message = { role: 'assistant', content: fullResponse }
                chatHistory = [...chatHistory, assistantMessage]
                
                return
              }
            } catch (parseError) {
              console.error('Error parsing stream chunk:', parseError)
            }
          }
        }
      } catch (streamError) {
        console.error('Streaming error:', streamError)
        res.end()
        throw streamError
      }
    } else {
      throw new Error('No response body from Ollama')
    }
  } catch (error) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: `Chat error: ${errorMessage}` })
  }
}
