// types/index.ts
export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  id?: string
}

export interface User {
  id: string
  email: string
}

export interface AuthData {
  email: string
  password: string
}

export interface ChatResponse {
  response: string
  sessionId?: string
  messageCount?: number
  error?: string
}

export interface AuthResponse {
  session?: any
  user?: User
  error?: string
  message?: string
}

export interface ChatSession {
  id: string
  user_id: string
  messages: Message[]
  created_at: string
  updated_at: string
  title?: string
}

export interface LoadChatsResponse {
  chats: ChatSession[]
  success: boolean
  error?: string
}

export interface OllamaRequest {
  model: string
  messages: Message[]
  stream: boolean
}

export interface OllamaResponse {
  message: {
    role: string
    content: string
  }
}
