# Ollama AI Assistant

A full-stack application that connects to Ollama for AI chat functionality with user authentication via Supabase.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Ollama** installed and running locally
3. **Supabase account** (for authentication)

## Setup Instructions

### 1. Install Ollama

Download and install Ollama from [https://ollama.ai](https://ollama.ai)

After installation, pull a model:
```bash
ollama pull llama3.2:3b
```

### 2. Setup Supabase

1. Create a new project at [https://supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create a `.env` file in the root directory (copy from `.env.example`)
4. Replace the placeholder values with your actual Supabase credentials

### 3. Install Dependencies

Run the setup command to install all dependencies:
```bash
npm run setup
```

### 4. Start the Application

#### Option 1: Run both server and client together
```bash
npm run dev
```

#### Option 2: Run separately
```bash
# Terminal 1 - Start the server
npm run server

# Terminal 2 - Start the client
npm run client
```

## Usage

1. The client will open at `http://localhost:3000`
2. The server runs on `http://localhost:4000`
3. Sign up for a new account or login with existing credentials
4. Start chatting with the AI assistant!

## Project Structure

```
ollama-assistant/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api.js         # API calls
│   │   ├── App.js         # Main app component
│   │   ├── ChatPage.js    # Chat interface
│   │   └── index.js       # React entry point
│   └── package.json
├── server/
│   └── index.js           # Express server
├── package.json           # Root package.json
└── .env.example          # Environment variables template
```

## Troubleshooting

- **Ollama connection error**: Make sure Ollama is running (`ollama serve`)
- **Model not found**: Pull the model with `ollama pull llama3.2:3b`
- **Supabase auth error**: Check your environment variables in `.env`
- **Port conflicts**: Change the PORT in `.env` if 4000 is already in use
