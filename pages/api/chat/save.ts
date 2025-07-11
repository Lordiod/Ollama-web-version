import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Message } from '../../../types'

// Create a Supabase client with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kncolxdswqhznaljmyup.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY 

// Fallback to anon key if service key is not available
const supabaseKey = supabaseServiceKey && supabaseServiceKey !== 'YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE' 
  ? supabaseServiceKey 
  : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuY29seGRzd3Foem5hbGpteXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDEzOTYsImV4cCI6MjA2NzQ3NzM5Nn0._z6Dryqzvh8x590vmEHcIZO8JLzlspwj7FjuvrNJRkA')

const supabase = createClient(supabaseUrl, supabaseKey)

interface SaveChatRequest extends NextApiRequest {
  body: {
    sessionId: string
    messages: Message[]
    userId: string
  }
}

export default async function handler(
  req: SaveChatRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId, messages, userId } = req.body

  console.log('Save request:', { sessionId, userId, messagesCount: messages?.length })
  console.log('User ID type:', typeof userId, 'Value:', userId)

  if (!sessionId || !messages || !userId) {
    console.log('Missing required fields:', { sessionId: !!sessionId, messages: !!messages, userId: !!userId })
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Generate title for new chats
    let title = 'New Chat'
    if (messages.length > 1) {
      const firstUserMessage = messages.find(msg => msg.role === 'user')
      if (firstUserMessage) {
        title = firstUserMessage.content.slice(0, 50)
        if (firstUserMessage.content.length > 50) {
          title += '...'
        }
        title = title.replace(/\n/g, ' ').trim()
      }
    }

    // Check if chat session already exists
    const { data: existingChat, error: fetchError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw fetchError
    }

    const chatData = {
      id: sessionId,
      user_id: userId, // This will be automatically converted to UUID by Supabase
      messages: messages,
      title: title,
      updated_at: new Date().toISOString()
    }

    if (existingChat) {
      // Update existing chat
      console.log('Updating existing chat session')
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update(chatData)
        .eq('id', sessionId)
        .eq('user_id', userId)

      if (updateError) throw updateError
    } else {
      // Create new chat
      console.log('Creating new chat session')
      const { error: insertError } = await supabase
        .from('chat_sessions')
        .insert({
          ...chatData,
          created_at: new Date().toISOString()
        })

      if (insertError) throw insertError
    }

    console.log('Chat saved successfully')
    res.json({ 
      success: true,
      message: 'Chat saved successfully'
    })
  } catch (error) {
    console.error('Error saving chat:', error)
    res.status(500).json({ error: 'Failed to save chat' })
  }
}
