# Contributing to INSCRIBE

Thank you for your interest in contributing to INSCRIBE! 🎉 We welcome contributions from developers, researchers, and users who want to help improve the paper-to-code generation experience.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Before You Contribute](#before-you-contribute)
- [How to Contribute](#how-to-contribute)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We are committed to providing a welcoming and inspiring community for all.

**Our Standards:**

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

## ⚡ Before You Contribute

### Prerequisites

Before contributing, please ensure you have:

1. **Read the Documentation**: Familiarize yourself with the project by reading:

   - [README.md](./README.md) - Project overview
   - [docs/architecture.md](./docs/architecture.md) - System architecture
   - [docs/development.md](./docs/development.md) - Development setup

2. **Set Up Your Environment**:

   - Node.js (v18+ recommended)
   - npm or yarn package manager
   - Git for version control
   - Ollama for AI model testing (optional for non-AI contributions)

3. **Check Existing Issues**: Look through existing issues and pull requests to avoid duplication

4. **Fork the Repository**: Create your own fork to work on

## 🛠️ How to Contribute

### Types of Contributions We Welcome

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Propose new functionality
- 📚 **Documentation**: Improve guides, examples, and API docs
- 🧪 **Tests**: Add or improve test coverage
- 🔧 **Code**: Fix bugs or implement features
- 🎨 **UI/UX**: Improve user interface and experience

## 📝 Issue Guidelines

### Creating Issues

**IMPORTANT**: All issues MUST follow our issue templates. Issues that don't follow the templates will be closed and marked as invalid.

#### For Bug Reports:

```markdown
**Bug Description**: Clear description of the issue
**Steps to Reproduce**:

1. Step one
2. Step two
3. Step three

**Expected Behavior**: What should happen
**Actual Behavior**: What actually happens
**Environment**:

- OS: [e.g., macOS 12.0]
- Node.js version: [e.g., 18.17.0]
- INSCRIBE version: [e.g., 1.0.0]

**Additional Context**: Screenshots, logs, or other relevant information
```

#### For Feature Requests:

Use our enhancement template from `.github/issues/` folder:

```markdown
Which part of INSCRIBE would this enhance? (e.g., PDF processing, code generation, UI, etc.)

## 📋 Current Behavior

Describe how the feature currently works.

## ✨ Proposed Enhancement

Describe your proposed improvement in detail.

## 🎯 Expected Benefits

- Improved performance by X%
- Better user experience through Y
- Enhanced accuracy for Z cases

## 🔧 Implementation Approach

- [ ] Backend changes required
- [ ] Frontend/UI changes required
- [ ] New dependencies needed
- [ ] Configuration changes needed

## 💡 Additional Details

- **Priority**: High/Medium/Low
- **Complexity**: Simple/Moderate/Complex
- **Skills needed**: [e.g., Node.js, AI/ML, PDF processing]
```

### Issue Labels

We use the following labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `help-wanted` - Extra attention is needed
- `good-first-issue` - Good for newcomers
- `priority-high` - High priority issue
- `priority-medium` - Medium priority issue
- `priority-low` - Low priority issue

## 🔄 Pull Request Process

### Before Submitting

1. **Create an Issue First**: For significant changes, create an issue to discuss the approach
2. **Fork and Branch**: Create a feature branch from `main`
3. **Follow Coding Standards**: Ensure your code follows our style guide
4. **Write Tests**: Add or update tests for your changes
5. **Update Documentation**: Update relevant documentation

### PR Requirements

**Your pull request MUST include:**

✅ **Clear Description**:

- What changes were made
- Why the changes were necessary
- How to test the changes

✅ **Issue Reference**:

- Link to the related issue(s)
- Use "Fixes #123" or "Closes #123" for automatic linking

✅ **Testing Evidence**:

- All existing tests pass
- New tests added for new functionality
- Manual testing completed

✅ **Documentation Updates**:

- README updated if needed
- API documentation updated
- Inline code comments added

### PR Template

```markdown
## 📝 Description

Brief description of changes made.

## 🔗 Related Issue

Fixes #[issue-number]

## 🧪 Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update

## ✅ Testing

- [ ] All existing tests pass
- [ ] New tests added and passing
- [ ] Manual testing completed

## 📚 Documentation

- [ ] README updated
- [ ] API documentation updated
- [ ] Inline comments added

## 📸 Screenshots (if applicable)

Add screenshots for UI changes.
```

## 💻 Development Setup

### Quick Start

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/paper_to_code.git
cd paper_to_code

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Run tests
npm test

# 5. Start development server
npm run dev
```

### Development Commands

```bash
npm run dev          # Start development mode
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
npm run build        # Build for production
```

## 📏 Coding Standards

### JavaScript/Node.js Standards

- **ES6+ Features**: Use modern JavaScript features
- **Async/Await**: Prefer async/await over Promises
- **Error Handling**: Always handle errors properly
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic

```javascript
// ✅ Good
async function analyzeResearchPaper(paperPath) {
  try {
    const content = await extractPaperContent(paperPath);
    const analysis = await performNLPAnalysis(content);
    return analysis;
  } catch (error) {
    logger.error("Failed to analyze paper:", error);
    throw new Error(`Paper analysis failed: ${error.message}`);
  }
}

// ❌ Bad
function analyzePaper(p) {
  // No error handling, unclear naming
  return extractContent(p).then((c) => analyze(c));
}
```

### File Organization

```
src/
├── commands/         # CLI command handlers
├── generator/        # Code generation logic
├── ollama/          # AI model integration
├── paper/           # Paper processing
├── ui/              # User interface components
└── utils/           # Utility functions
```

### Commit Message Format

Use conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

**Examples:**

```
feat(paper): add mathematical formula extraction
fix(cli): resolve PDF parsing error for large files
docs(api): update code generation documentation
```

## 🧪 Testing Requirements

### Test Coverage

- **Unit Tests**: All new functions must have unit tests
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete workflows
- **Minimum Coverage**: 80% code coverage required

### Writing Tests

```javascript
// Example test structure
describe("PaperAnalyzer", () => {
  describe("extractTitle", () => {
    it("should extract title from PDF content", async () => {
      // Arrange
      const mockContent = "Title: Attention Is All You Need\n\nAbstract...";

      // Act
      const title = await analyzer.extractTitle(mockContent);

      // Assert
      expect(title).toBe("Attention Is All You Need");
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test paper.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 Documentation

### Documentation Standards

- **Clear Examples**: Include practical code examples
- **API Documentation**: Document all public functions and classes
- **User Guides**: Step-by-step instructions for users
- **Architecture Docs**: Explain system design decisions

### Updating Documentation

When making changes that affect:

- **User Interface**: Update user guide
- **API**: Update API documentation
- **Configuration**: Update configuration guide
- **Architecture**: Update architecture overview

## 🎯 Areas Needing Help

We especially welcome contributions in these areas:

### High Priority

- 🐛 **Bug Fixes**: Help us squash bugs
- 📚 **Documentation**: Improve guides and examples
- 🧪 **Test Coverage**: Add more comprehensive tests

### Medium Priority

- ✨ **Feature Enhancements**: Implement planned features
- 🎨 **UI Improvements**: Better user experience
- ⚡ **Performance**: Optimize processing speed

### Future Goals

- 🌐 **Multi-language Support**: Support for more programming languages
- 🔄 **Interactive Features**: Real-time code refinement
- 📊 **Analytics**: Usage metrics and insights

## 🚨 Common Mistakes to Avoid

1. **Not Following Issue Templates**: Issues without templates will be closed
2. **Large PRs Without Discussion**: Create an issue first for big changes
3. **No Tests**: All code changes must include appropriate tests
4. **Ignoring Linting**: Fix all linting errors before submitting
5. **Poor Commit Messages**: Use conventional commit format
6. **Missing Documentation**: Update docs for user-facing changes

## 📞 Getting Help

Need help getting started? Here are ways to get support:

- 💬 **GitHub Discussions**: Ask questions and get community help
- 🐛 **Issues**: Report bugs or request features
- 📧 **Maintainers**: Contact project maintainers for complex topics
- 📖 **Documentation**: Comprehensive guides in `/docs` folder

## 🏆 Recognition

Contributors will be recognized in:

- **Contributors List**: Added to README
- **Release Notes**: Mentioned in changelog
- **Hall of Fame**: Special recognition for significant contributions

## 📄 License

By contributing to INSCRIBE, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to INSCRIBE!** 🙏

Every contribution, no matter how small, helps make INSCRIBE better for researchers and developers worldwide.

**Questions?** Feel free to ask in GitHub Discussions or create an issue.

---

**Last Updated**: September 28, 2025
**Maintainers**: SAGEA AI Team
