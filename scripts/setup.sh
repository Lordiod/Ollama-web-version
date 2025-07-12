#!/bin/bash

# Ollama Web Assistant Setup Script
# This script helps set up the development environment

set -e

echo "Setting up Ollama Web Assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "Node.js $(node --version) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm."
    exit 1
fi

echo "npm $(npm --version) is installed"

# Install dependencies
echo "Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cp .env.example .env.local
    echo "Please update .env.local with your Supabase credentials"
else
    echo ".env.local already exists"
fi

# Check if Ollama is installed
if command -v ollama &> /dev/null; then
    echo "Ollama is installed"
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags &> /dev/null; then
        echo "Ollama is running"
        
        # List available models
        echo "Available Ollama models:"
        ollama list
        
        # Suggest model installation if none found
        if [ $(ollama list | wc -l) -eq 1 ]; then
            echo "No models found. Consider installing a model:"
            echo "   ollama pull llama3.2:3b"
        fi
    else
        echo "Ollama is not running. Start it with: ollama serve"
    fi
else
    echo "Ollama is not installed. Please install it from https://ollama.ai"
fi

# Run type checking
echo "Running type checking..."
npm run type-check

# Run linting
echo "Running linting..."
npm run lint

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Ensure Ollama is running: ollama serve"
echo "3. Install an Ollama model: ollama pull llama3.2:3b"
echo "4. Start the development server: npm run dev"
echo ""
