import { NextApiRequest, NextApiResponse } from 'next'
import { Message } from '../../../types'

interface GenerateTitleRequest extends NextApiRequest {
  body: {
    messages: Message[]
  }
}

export default async function handler(
  req: GenerateTitleRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required' })
  }

  try {
    // Find the first user message to generate a title from
    const firstUserMessage = messages.find(msg => msg.role === 'user')
    
    if (!firstUserMessage) {
      return res.json({ title: 'New Chat' })
    }

    // Generate a simple title from the first user message
    let title = firstUserMessage.content.slice(0, 50)
    if (firstUserMessage.content.length > 50) {
      title += '...'
    }

    // Clean up the title
    title = title.replace(/\n/g, ' ').trim()
    
    if (!title) {
      title = 'New Chat'
    }

    res.json({ title, success: true })
  } catch (error) {
    console.error('Error generating title:', error)
    res.status(500).json({ error: 'Failed to generate title' })
  }
}
