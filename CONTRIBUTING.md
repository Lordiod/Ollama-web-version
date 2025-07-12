# Contributing to Ollama Web Assistant

We welcome contributions to the Ollama Web Assistant project! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Ollama installed locally
- Supabase account (for full functionality)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ollama-web-assistant.git
   cd ollama-web-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment example:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your Supabase credentials

5. Start Ollama:
   ```bash
   ollama serve
   ollama pull llama3.2:3b
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Enable strict mode in TypeScript configuration
- Use meaningful variable and function names

### React/Next.js

- Use functional components with hooks
- Prefer TypeScript interfaces over types where possible
- Use proper error boundaries
- Follow Next.js best practices for API routes

### Styling

- Use Tailwind CSS for styling
- Follow responsive design principles
- Maintain consistent spacing and typography
- Use semantic HTML elements

## Testing

Before submitting a pull request:

1. Run type checking:
   ```bash
   npm run type-check
   ```

2. Run linting:
   ```bash
   npm run lint
   ```

3. Test the application manually:
   - Authentication flow
   - Chat functionality
   - Error handling
   - Responsive design

## Commit Guidelines

### Commit Message Format

Use the following format for commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add password reset functionality

fix(chat): resolve message persistence issue

docs(readme): update installation instructions

style(components): improve button styling consistency
```

## Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Add comments for complex logic
   - Update documentation if needed

3. **Test Your Changes**
   - Verify all existing functionality works
   - Test your new feature thoroughly
   - Check for TypeScript errors
   - Run the linter

4. **Submit Pull Request**
   - Push your branch to your fork
   - Create a pull request with a clear description
   - Reference any related issues
   - Include screenshots for UI changes

## Issues and Bug Reports

When reporting bugs, please include:

- Operating system and version
- Node.js version
- Browser and version (if applicable)
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Any error messages or logs

## Feature Requests

For feature requests, please provide:

- Clear description of the feature
- Use case or problem it solves
- Proposed implementation (if applicable)
- Any relevant mockups or examples

## Security

If you discover a security vulnerability, please email us directly instead of creating a public issue. We take security seriously and will respond promptly.

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, feel free to:

- Create an issue for discussion
- Reach out to the maintainers
- Check the existing documentation

Thank you for contributing to Ollama Web Assistant!
