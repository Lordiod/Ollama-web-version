import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

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
    res.status(500).json({ error: 'Internal server error' })
  }
}
