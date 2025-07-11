import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat'
    
    // Test simple chat message
    const testRequest = {
      model: 'llama3.2:3b',
      messages: [
        { role: 'user', content: 'Say hello' }
      ],
      stream: false
    }

    console.log('Testing Ollama chat connection:', ollamaUrl)

    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    res.json({ 
      status: 'success',
      ollamaUrl,
      response: result,
      message: 'Ollama chat API is working correctly'
    })
  } catch (error) {
    console.error('Ollama test error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ 
      status: 'error',
      error: errorMessage,
      message: 'Failed to connect to Ollama'
    })
  }
}
