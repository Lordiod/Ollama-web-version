import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kncolxdswqhznaljmyup.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY 

// Fallback to anon key if service key is not available
const supabaseKey = supabaseServiceKey && supabaseServiceKey !== 'YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE' 
  ? supabaseServiceKey 
  : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuY29seGRzd3Foem5hbGpteXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDEzOTYsImV4cCI6MjA2NzQ3NzM5Nn0._z6Dryqzvh8x590vmEHcIZO8JLzlspwj7FjuvrNJRkA')

const supabase = createClient(supabaseUrl, supabaseKey)

interface DeleteChatRequest extends NextApiRequest {
  body: {
    sessionId: string
    userId: string
  }
}

export default async function handler(
  req: DeleteChatRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId, userId } = req.body

  if (!sessionId || !userId) {
    return res.status(400).json({ error: 'Session ID and User ID are required' })
  }

  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId)

    if (error) throw error

    res.json({ 
      success: true,
      message: 'Chat session deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting chat session:', error)
    res.status(500).json({ error: 'Failed to delete chat session' })
  }
}
