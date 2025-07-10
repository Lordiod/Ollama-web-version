# Ollama Assistant - Next.js + TypeScript

A modern, type-safe AI assistant built with Next.js 14, TypeScript, integrating Ollama for local AI inference and Supabase for authentication.

## 🚀 Features

- 🤖 **Local AI Chat**: Powered by Ollama (llama3.2:3b model)
- 🔐 **Authentication**: Secure signup/login with Supabase
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- ⚡ **Full-stack**: Built with Next.js API routes
- � **TypeScript**: Full type safety and better developer experience
- �🚀 **Easy Setup**: Simple configuration and deployment

## 📦 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **AI**: Ollama (Local AI inference)
- **Development**: ESLint, TypeScript compiler

## 🏗️ Project Structure

```
├── components/          # React components (TypeScript)
│   ├── Auth.tsx        # Authentication component
│   └── Chat.tsx        # Chat interface component
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client configuration
├── pages/              # Next.js pages and API routes
│   ├── api/            # API endpoints (TypeScript)
│   │   ├── auth/       # Authentication endpoints
│   │   │   ├── login.ts
│   │   │   └── signup.ts
│   │   └── chat.ts     # Chat API endpoint
│   ├── _app.tsx        # App wrapper
│   └── index.tsx       # Home page
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS imports
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared interfaces and types
├── .env.local          # Environment variables
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## 🚦 Quick Start

### Prerequisites

- Node.js 18+ 
- Ollama installed and running locally
- Supabase account (optional - defaults provided)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OLLAMA_URL=http://localhost:11434/api/generate
```

3. Make sure Ollama is running:
```bash
ollama serve
ollama pull llama3.2:3b
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication  
- `POST /api/chat` - Chat with AI model

## 🎯 TypeScript Features

### Type Safety
- **Strict TypeScript**: Full type checking enabled
- **Interface Definitions**: Shared types for API responses and data structures
- **Component Props**: Typed React component props
- **API Routes**: Typed Next.js API handlers

### Key Types
```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AuthData {
  email: string
  password: string
}

interface ChatResponse {
  response: string
  error?: string
}
```

## ⚙️ Configuration

### Ollama Setup
Make sure you have the llama3.2:3b model installed:
```bash
ollama pull llama3.2:3b
```

### Supabase Setup (Optional)
1. Create a new Supabase project
2. Copy your project URL and anon key
3. Add them to your `.env.local` file

### TypeScript Configuration
The project uses strict TypeScript settings with:
- Strict null checks
- No implicit any
- Unused locals detection
- Path mapping for imports

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
Build the project and deploy the `.next` folder:
```bash
npm run build
npm run start
```

## 🔄 Migration from JavaScript

This project has been fully migrated from JavaScript to TypeScript:

1. **File Extensions**: All `.js` files converted to `.ts`/`.tsx`
2. **Type Definitions**: Added comprehensive type definitions
3. **API Routes**: Typed Next.js API handlers
4. **Components**: Typed React components with proper prop interfaces
5. **Configuration**: TypeScript configuration with strict settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Run type checking: `npm run type-check`
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🆘 Troubleshooting

### Common Issues

1. **TypeScript Errors**: Run `npm run type-check` to see detailed type errors
2. **Ollama Connection**: Ensure Ollama is running on localhost:11434
3. **Environment Variables**: Check that `.env.local` is properly configured
4. **Dependencies**: Run `npm install` to ensure all packages are installed

### Development Tips

- Use VS Code with TypeScript extensions for best development experience
- Enable auto-imports for faster development
- Use the TypeScript compiler to catch errors early
- Leverage IntelliSense for better code completion

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
