import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kncolxdswqhznaljmyup.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuY29seGRzd3Foem5hbGpteXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDEzOTYsImV4cCI6MjA2NzQ3NzM5Nn0._z6Dryqzvh8x590vmEHcIZO8JLzlspwj7FjuvrNJRkA'

export const supabase = createClient(supabaseUrl, supabaseKey)
