# INSCRIBE Installation Guide

This guide will help you install and set up INSCRIBE on your system. Follow the steps for your operating system to get started with AI-powered paper-to-code generation.

## 📋 System Requirements

### Minimum Requirements

- **Operating System**: macOS 10.15+, Ubuntu 18.04+, Windows 10+
- **Node.js**: Version 18.0 or higher
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Storage**: 2GB free space for installation and models
- **Internet**: Required for AI model downloads and updates

### Recommended Requirements

- **Node.js**: Version 20.0+ (LTS)
- **Memory**: 16GB RAM for optimal performance
- **Storage**: 10GB+ for models and generated code
- **CPU**: Multi-core processor for faster processing

## 🚀 Quick Installation

### Option 1: Global Installation (Recommended)

```bash
# Install INSCRIBE globally via npm
npm install -g @sagea-llc/inscribe-cli

# Verify installation
inscribe --version
```

### Option 2: Local Installation

```bash
# Create a new project directory
mkdir my-inscribe-project
cd my-inscribe-project

# Install locally
npm install @sagea-llc/inscribe-cli

# Run with npx
npx inscribe --help
```

### Option 3: Development Installation

```bash
# Clone the repository
git clone https://github.com/sagea-ai/paper_to_code.git
cd paper_to_code

# Install dependencies
npm install

# Link for global use
npm link

# Verify installation
inscribe --version
```

## 🖥️ Platform-Specific Instructions

### macOS Installation

#### Using Homebrew (Recommended)

```bash
# Install Node.js if not already installed
brew install node

# Install INSCRIBE
npm install -g @sagea-llc/inscribe-cli

# Install additional dependencies
brew install poppler  # For PDF processing
```

#### Manual Installation

```bash
# Download and install Node.js from nodejs.org
# Then install INSCRIBE
npm install -g inscribe-ai
```

### Ubuntu/Debian Installation

```bash
# Update package list
sudo apt update

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PDF processing tools
sudo apt-get install -y poppler-utils

# Install INSCRIBE
npm install -g inscribe-ai

# Verify installation
inscribe --version
```

### Windows Installation

#### Using Chocolatey

```powershell
# Install Node.js (if not installed)
choco install nodejs

# Install INSCRIBE
npm install -g inscribe-ai
```

#### Manual Installation

1. Download and install Node.js from [nodejs.org](https://nodejs.org/)
2. Open Command Prompt or PowerShell as Administrator
3. Run: `npm install -g inscribe-ai`

#### Windows Subsystem for Linux (WSL)

```bash
# Follow Ubuntu installation steps within WSL
# This provides the best compatibility
```

## 🤖 AI Model Setup (Ollama)

INSCRIBE requires Ollama for AI-powered code generation.

### Install Ollama

#### macOS

```bash
# Download and install from ollama.ai
curl -fsSL https://ollama.ai/install.sh | sh

# Or using Homebrew
brew install ollama
```

#### Linux

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows

1. Download Ollama from [ollama.ai](https://ollama.ai)
2. Run the installer
3. Follow the setup wizard

### Download Required Models

```bash
# Start Ollama service
ollama serve

# In a new terminal, download the required model
ollama pull sage-reasoning:3b

# Verify model installation
ollama list
```

### Alternative AI Models

```bash
# For better performance (requires more resources)
ollama pull llama2:13b

# For faster processing (lower quality)
ollama pull llama2:7b
```

## ⚙️ Configuration Setup

### Initial Configuration

```bash
# Create configuration directory
mkdir -p ~/.inscribe

# Generate default configuration
inscribe --init

# Edit configuration file
nano ~/.inscribe/config.json
```

### Default Configuration File

```json
{
  "defaultLanguage": "python",
  "outputDirectory": "./generated",
  "aiModel": "sage-reasoning:3b",
  "ollama": {
    "host": "localhost",
    "port": 11434,
    "timeout": 30000
  },
  "templates": {
    "includeDocstrings": true,
    "addTypeHints": true,
    "generateTests": false,
    "codeComplexity": "intermediate"
  },
  "ui": {
    "colorScheme": "auto",
    "verboseOutput": false,
    "showProgress": true
  }
}
```

## 🧪 Verify Installation

### Basic Verification

```bash
# Check INSCRIBE version
inscribe --version

# Check help output
inscribe --help

# Test configuration
inscribe --check-setup
```

### System Check

```bash
# Run comprehensive system check
inscribe --doctor

# Expected output:
✅ Node.js version: 20.5.0
✅ INSCRIBE version: 1.0.0
✅ Ollama service: Running
✅ AI model: sage-reasoning:3b available
✅ PDF tools: poppler-utils installed
✅ Configuration: Valid
```

### Test Installation

```bash
# Download a test paper (or use your own)
wget https://arxiv.org/pdf/1706.03762.pdf -O attention_paper.pdf

# Test paper-to-code generation
inscribe --paper attention_paper.pdf --language python --output ./test-output

# Check generated files
ls -la ./test-output/
```

## 🔧 Troubleshooting

### Common Issues

#### "Command not found: inscribe"

**Solution for Global Installation:**

```bash
# Check npm global directory
npm config get prefix

# Add to PATH in ~/.bashrc or ~/.zshrc
export PATH="$PATH:$(npm config get prefix)/bin"

# Reload shell configuration
source ~/.zshrc
```

**Solution for Local Installation:**

```bash
# Use npx instead
npx inscribe --help
```

#### "Ollama connection failed"

**Check Ollama Service:**

```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama service
ollama serve

# Check port availability
netstat -an | grep 11434
```

**Alternative Configuration:**

```json
{
  "ollama": {
    "host": "127.0.0.1",
    "port": 11434,
    "timeout": 60000
  }
}
```

#### "PDF processing failed"

**Install PDF Tools:**

```bash
# macOS
brew install poppler

# Ubuntu/Debian
sudo apt-get install poppler-utils

# Windows (using Chocolatey)
choco install poppler
```

#### "Permission denied" errors

**Fix Permissions:**

```bash
# Fix global npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Add to shell profile
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
```

### Debug Mode

Enable debug output for troubleshooting:

```bash
# Enable debug logging
DEBUG=inscribe* inscribe --paper paper.pdf --verbose

# Check log files
tail -f ~/.inscribe/logs/inscribe.log
```

### System Information

Collect system information for support:

```bash
# Generate system report
inscribe --system-info > system-report.txt

# Share this file when requesting support
```

## 🔄 Updates and Maintenance

### Updating INSCRIBE

```bash
# Update global installation
npm update -g inscribe-ai

# Update local installation
npm update inscribe-ai

# Check for updates
npm outdated -g inscribe-ai
```

### Updating AI Models

```bash
# Update to latest model version
ollama pull sage-reasoning:3b

# Clean up old models
ollama rm old-model-name

# List available models
ollama list
```

### Configuration Migration

When updating between versions:

```bash
# Backup current configuration
cp ~/.inscribe/config.json ~/.inscribe/config.json.backup

# Run migration (if needed)
inscribe --migrate-config

# Verify new configuration
inscribe --check-config
```

## 🏢 Enterprise Installation

### Multi-User Setup

```bash
# Install system-wide
sudo npm install -g inscribe-ai

# Create shared configuration
sudo mkdir -p /etc/inscribe
sudo cp ~/.inscribe/config.json /etc/inscribe/config.json

# Set appropriate permissions
sudo chmod 644 /etc/inscribe/config.json
```

### Docker Installation

```dockerfile
# Dockerfile for INSCRIBE
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache poppler-utils

# Install INSCRIBE
RUN npm install -g inscribe-ai

# Create working directory
WORKDIR /workspace

# Set entrypoint
ENTRYPOINT ["inscribe"]
```

```bash
# Build Docker image
docker build -t inscribe:latest .

# Run with Docker
docker run -v $(pwd):/workspace inscribe --paper paper.pdf
```

### Kubernetes Deployment

```yaml
# inscribe-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: inscribe-worker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: inscribe
  template:
    metadata:
      labels:
        app: inscribe
    spec:
      containers:
        - name: inscribe
          image: inscribe:latest
          resources:
            requests:
              memory: "4Gi"
              cpu: "1"
            limits:
              memory: "8Gi"
              cpu: "2"
```

## 📞 Getting Help

### Documentation

- 📖 [User Guide](./user-guide.md)
- 🏗️ [Architecture Guide](./architecture.md)

### Community Support

- 💬 [GitHub Discussions](https://github.com/sagea-ai/paper_to_code/discussions)
- 🐛 [Report Issues](https://github.com/sagea-ai/paper_to_code/issues)
- 📧 Email: support@sagea.ai

### Professional Support

- 🏢 Enterprise installation support
- 📞 Priority technical support
- 🎓 Training and workshops

---

**Congratulations!** 🎉 You've successfully installed INSCRIBE.

Ready to transform research papers into code? Check out the [User Guide](./user-guide.md) to get started!

---

**Last Updated**: September 28, 2025  
**Installation Guide Version**: 1.0
