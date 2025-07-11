import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { AuthData, AuthResponse } from '../../../types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password }: AuthData = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password 
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Signup successful! Check your email to confirm.' })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
