@echo off
REM Ollama Web Assistant Setup Script for Windows
REM This script helps set up the development environment

echo Setting up Ollama Web Assistant...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

echo Node.js is installed
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo npm is installed
npm --version

REM Install dependencies
echo Installing dependencies...
npm install

REM Create environment file if it doesn't exist
if not exist .env.local (
    echo Creating .env.local file...
    copy .env.example .env.local
    echo Please update .env.local with your Supabase credentials
) else (
    echo .env.local already exists
)

REM Check if Ollama is available
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Ollama is not installed. Please install it from https://ollama.ai
) else (
    echo Ollama is installed
    ollama --version
    
    REM Check if Ollama is running by attempting to list models
    ollama list >nul 2>&1
    if %errorlevel% neq 0 (
        echo Ollama is not running. Start it with: ollama serve
    ) else (
        echo Ollama is running
        echo Available Ollama models:
        ollama list
    )
)

REM Run type checking
echo Running type checking...
npm run type-check

REM Run linting
echo Running linting...
npm run lint

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Update .env.local with your Supabase credentials
echo 2. Ensure Ollama is running: ollama serve
echo 3. Install an Ollama model: ollama pull llama3.2:3b
echo 4. Start the development server: npm run dev
echo.
pause
