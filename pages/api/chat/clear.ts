import { NextApiRequest, NextApiResponse } from 'next'

// Import the same session storage from chat.ts
// In a real app, this would be in a shared module or database
const chatSessions: Map<string, any[]> = new Map()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId = 'default' } = req.body

  try {
    // Clear the chat session
    chatSessions.delete(sessionId)
    
    res.json({ 
      success: true,
      message: `Chat session ${sessionId} cleared`
    })
  } catch (error) {
    console.error('Error clearing chat session:', error)
    res.status(500).json({ error: 'Failed to clear chat session' })
  }
}
