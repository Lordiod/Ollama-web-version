import { NextApiRequest, NextApiResponse } from 'next'
import { ChatResponse, OllamaRequest, OllamaResponse } from '../../types'

interface ChatRequest extends NextApiRequest {
  body: {
    prompt: string
  }
}

export default async function handler(
  req: ChatRequest,
  res: NextApiResponse<ChatResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate'
    
    const ollamaRequest: OllamaRequest = {
      model: 'llama3.2:3b',
      prompt,
      stream: false
    }

    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaRequest)
    })

    if (!response.ok) {
      throw new Error('Ollama server error')
    }

    const result: OllamaResponse = await response.json()
    res.json({ response: result.response })
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ error: 'Ollama server error' })
  }
}
