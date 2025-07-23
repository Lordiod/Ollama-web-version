# Contributing to Ollama AI Assistant

Thank you for your interest in contributing to Ollama AI Assistant! We welcome contributions from the community and appreciate your help in making this project better.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Ollama installed and running
- Supabase account

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/ollama-web-assistant.git
   cd ollama-web-assistant
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up your environment variables (see README.md)
5. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Use Prettier for code formatting

### Component Structure
- Keep components focused and single-purpose
- Use TypeScript interfaces for props
- Implement proper error boundaries
- Follow React best practices

### API Guidelines
- Validate all inputs
- Use proper HTTP status codes
- Implement proper error handling
- Document API endpoints

## 📝 Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Write or update tests** if applicable

4. **Test your changes** thoroughly:
   ```bash
   npm run type-check
   npm run build
   ```

5. **Commit your changes** with a clear message:
   ```bash
   git commit -m "feat: add amazing new feature"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** with:
   - Clear title and description
   - Screenshots/videos if UI changes
   - Reference to any related issues

## 🐛 Bug Reports

When reporting bugs, please include:
- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable

## 💡 Feature Requests

For feature requests, please:
- Check if the feature already exists
- Describe the feature and its benefits
- Provide use cases
- Consider implementation complexity

## 🏷️ Commit Convention

We use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

## 📋 Issue Templates

### Bug Report
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]
```

### Feature Request
```markdown
**Feature Description**
A clear description of the feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How would you implement this?

**Alternatives**
Any alternative solutions considered.
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Mobile responsiveness improvements
- [ ] Performance optimizations
- [ ] Accessibility enhancements
- [ ] Test coverage improvements

### Medium Priority
- [ ] Additional Ollama model support
- [ ] UI/UX improvements
- [ ] Documentation improvements
- [ ] Internationalization (i18n)

### Low Priority
- [ ] Additional themes
- [ ] Plugin system
- [ ] Advanced chat features
- [ ] Export/import functionality

## 🔒 Security

If you discover security vulnerabilities:
1. **DO NOT** create a public issue
2. Email us at: security@example.com
3. Include detailed steps to reproduce
4. Allow time for us to address the issue

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Ollama Documentation](https://ollama.ai/docs)

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions in project updates

## 💬 Questions?

Feel free to:
- Open a discussion on GitHub
- Join our community chat
- Reach out via email

Thank you for contributing! 🙏
