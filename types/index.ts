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
  error?: string
}

export interface AuthResponse {
  session?: any
  error?: string
  message?: string
}

export interface OllamaRequest {
  model: string
  prompt: string
  stream: boolean
}

export interface OllamaResponse {
  response: string
}
