# Ollama Web Assistant

A modern, full-stack web application that provides an intuitive chat interface for Ollama AI models with user authentication and persistent chat history.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

## Features

- **Local AI Integration**: Connect to Ollama models running locally for private, fast inference
- **Secure Authentication**: User registration and login system powered by Supabase
- **Chat Persistence**: Automatic saving and loading of conversation history
- **Responsive Design**: Modern UI built with Tailwind CSS that works on all devices
- **Real-time Chat**: Instant messaging with streaming responses
- **Type Safety**: Full TypeScript implementation for better developer experience
- **Session Management**: Advanced chat session handling with persistent storage

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with modern hooks
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - Database and authentication
- **Ollama** - Local AI model inference

### Development
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking

## Project Structure

```
ollama-web-assistant/
├── components/             # Reusable React components
│   ├── Auth.tsx           # Authentication forms and logic
│   └── Chat.tsx           # Main chat interface
├── lib/                   # Utility libraries and configurations
│   └── supabase.ts        # Supabase client configuration
├── pages/                 # Next.js pages and API routes
│   ├── api/               # Backend API endpoints
│   │   ├── auth/          # Authentication handlers
│   │   │   ├── login.ts   # User login endpoint
│   │   │   └── signup.ts  # User registration endpoint
│   │   └── chat/          # Chat-related API endpoints
│   │       ├── clear.ts   # Clear chat history
│   │       ├── delete.ts  # Delete specific chats
│   │       ├── generate-title.ts # Generate chat titles
│   │       ├── load.ts    # Load chat history
│   │       └── save.ts    # Save chat messages
│   ├── _app.tsx           # Application wrapper
│   └── index.tsx          # Main entry point
├── styles/                # Global styling
│   └── globals.css        # Tailwind CSS imports
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared interfaces and types
└── Configuration files
```

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Ollama** installed and running locally
- **Supabase** account (for authentication and data persistence)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ollama-web-assistant.git
   cd ollama-web-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_key
   ```

4. **Set up Ollama**
   ```bash
   # Start Ollama service
   ollama serve
   
   # Pull a model (example with Llama 3.2)
   ollama pull llama3.2:3b
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** to find your project URL and anon key
3. Update your `.env.local` file with these credentials
4. Set up the required database tables (see [Database Schema](#database-schema))

### Ollama Configuration

Ensure Ollama is running with your preferred model:

```bash
# List available models
ollama list

# Pull a specific model
ollama pull llama3.2:3b

# Start Ollama (if not running)
ollama serve
```

## Database Schema

The application requires the following Supabase tables:

### Users Table
Handled automatically by Supabase Auth.

### Conversations Table
```sql
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Messages Table
```sql
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  role text check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code analysis |
| `npm run lint:fix` | Run ESLint and fix issues automatically |
| `npm run type-check` | Verify TypeScript types |

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Chat Management
- `POST /api/chat` - Send message to AI
- `GET /api/chat/load` - Load chat history
- `POST /api/chat/save` - Save chat message
- `DELETE /api/chat/delete` - Delete chat
- `DELETE /api/chat/clear` - Clear all chats
- `POST /api/chat/generate-title` - Generate chat title

## Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Configure Environment Variables**
   Add your environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t ollama-web-assistant .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your_url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
     ollama-web-assistant
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

## Development

### Code Style

This project uses ESLint for code consistency:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Ollama Connection Failed**
- Verify Ollama is running: `ollama serve`
- Check if model is installed: `ollama list`
- Ensure port 11434 is not blocked

**Supabase Authentication Errors**
- Verify environment variables in `.env.local`
- Check Supabase project status
- Ensure database tables are created

**TypeScript Compilation Errors**
- Run `npm run type-check` for detailed errors
- Verify all dependencies are installed
- Check `tsconfig.json` configuration

**Build or Runtime Errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for providing excellent local AI models
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
---