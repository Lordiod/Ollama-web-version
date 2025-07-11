// types/index.ts
export interface Message {
  role: 'user' | 'assistant'
  content: string
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
  error?: string
  message?: string
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
