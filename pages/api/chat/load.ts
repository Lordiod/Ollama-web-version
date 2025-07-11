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

interface LoadChatsRequest extends NextApiRequest {
  query: {
    userId: string
  }
}

export default async function handler(
  req: LoadChatsRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.query

  console.log('Load request for userId:', userId)

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    const { data: chats, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Found', chats?.length || 0, 'chat sessions')

    res.json({ 
      chats: chats || [],
      success: true
    })
  } catch (error) {
    console.error('Error loading chats:', error)
    res.status(500).json({ error: 'Failed to load chats' })
  }
}
