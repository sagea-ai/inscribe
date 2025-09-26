# INSCRIBE

<div align="center">

![INSCRIBE Logo](images/inscribe-logo.png)

![INSCRIBE CLI UI](images/inscribe.png)

[![npm version](https://badge.fury.io/js/%40inscribe%2Fcli.svg)](https://badge.fury.io/js/%40inscribe%2Fcli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node.js-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Required-blue)](https://ollama.com/)
[![SAGE Models](https://img.shields.io/badge/SAGE%20Models-3B%20%7C%208B%20%7C%2014B-green)](https://huggingface.co/comethrusws)

_A powerful paper-to-code implementation tool powered by SAGE_

[Installation](#installation) •
[Features](#features) •
[Usage](#usage) •
[Commands](#commands) •
[Models](#models) •
[Contributing](#contributing)

</div>

---

## Overview

INSCRIBE is an intelligent paper-to-code implementation tool that transforms research papers into working code implementations. It leverages SAGE AI models through Ollama to analyze academic papers and generate comprehensive Python implementations of the algorithms and architectures described in the papers.

## Features

- **PDF Paper Processing**: Extract and analyze text from research papers
- **Intelligent Paper Analysis**: Identify algorithms, architectures, and key implementations
- **Code Generation**: Generate comprehensive Python implementations
- **Interactive CLI Interface**: Beautiful terminal UI for paper processing
- **AI-Powered Analysis**: Leverages SAGE reasoning models for understanding papers
- **Structured Output**: Organized code with documentation and examples
- **Multiple Paper Formats**: Support for various academic paper formats
- **Algorithm Focus**: Specialized in extracting and implementing core algorithms

## Prerequisites

> [!NOTE] > **Ollama Installation Required**: Before using INSCRIBE, you must have Ollama installed on your system along with pdftotext for PDF processing.

### Install Ollama

**macOS/Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download and install from [ollama.com/download](https://ollama.com/download)

## Installation

### Global Installation (Recommended)

```bash
npm install -g @inscribe/cli
```

### Local Installation

```bash
git clone https://github.com/sagea-ai/inscribe.git
cd inscribe
npm install
```

The installation process will automatically:

1. Check for Ollama installation
2. Pull the default SAGE model (`comethrusws/sage-reasoning:3b`)
3. Set up the CLI environment

## Usage

### Start the CLI

```bash
inscribe
```

### Basic Interaction

Once launched, you can:

- Process PDF research papers using `/paper` command
- Analyze paper structure and algorithms using `/analyze`
- Generate Python implementations using `/generate`
- Use other commands for file operations and utilities

### Example Session

```
╭────────────────────────────────────────────────────────────────╮
│ Use /paper <pdf-file> to analyze a research paper              │
│ Use /analyze to examine paper structure and algorithms         │
│ Use /generate to create Python implementations                 │
│ /help for more information and commands.                       │
╰────────────────────────────────────────────────────────────────╯

> /paper ./research/transformer_paper.pdf
> /analyze
> /generate
```

## Commands

| Command           | Description                    | Example               |
| ----------------- | ------------------------------ | --------------------- |
| `/paper <pdf>`    | Analyze a research paper       | `/paper ./paper.pdf`  |
| `/analyze`        | Show detailed paper analysis   | `/analyze`            |
| `/generate`       | Generate Python implementation | `/generate`           |
| `/help`           | Display help message           | `/help`               |
| `/about`          | Show version information       | `/about`              |
| `/clear`          | Clear the screen               | `/clear`              |
| `/edit <file>`    | Load a file into context       | `/edit src/app.js`    |
| `/run <command>`  | Execute a shell command        | `/run python test.py` |
| `exit` or `/quit` | Exit the application           | `exit`                |

## Keyboard Shortcuts

| Shortcut                | Action                   |
| ----------------------- | ------------------------ |
| `Ctrl+C`, `q`, `Escape` | Quit application         |
| `Ctrl+L`                | Clear the screen         |
| `↑` / `↓`               | Navigate command history |
| `Enter`                 | Send message             |

## AI Models

INSCRIBE leverages SAGE reasoning models for paper analysis and code generation:

### Available Models

| Model        | Parameters | Use Case                                  | Performance |
| ------------ | ---------- | ----------------------------------------- | ----------- |
| **SAGE 3B**  | 3 Billion  | General coding assistance, fast responses | Fast        |
| **SAGE 8B**  | 8 Billion  | Complex reasoning, detailed explanations  | Balanced    |
| **SAGE 14B** | 14 Billion | Advanced problem solving, research tasks  | Precise     |

### Default Model

The CLI uses `comethrusws/sage-reasoning:3b` by default, which provides an excellent balance of speed and capability for most coding tasks.

> [!TIP]
> Future versions will allow model switching directly from the CLI interface.

## Project Structure

```
inscribe/
├── bin/
│   └── cli.js              # CLI entry point
├── src/
│   ├── app.js              # Main application logic
│   ├── commands/
│   │   └── handler.js      # Command handling
│   ├── paper/
│   │   ├── parser.js       # PDF text extraction
│   │   └── analyzer.js     # Paper structure analysis
│   ├── generator/
│   │   └── codeGenerator.js # Python code generation
│   ├── ollama/
│   │   └── client.js       # AI model integration
│   └── ui/
│       └── logo.js         # ASCII logo rendering
├── scripts/
│   └── install.js          # Post-install setup
├── images/
│   ├── inscribe-logo.png   # Project logo
│   └── inscribe.png        # CLI UI preview
└── package.json
```

## Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/sagea-ai/inscribe.git
cd inscribe

# Install dependencies
npm install

# Run in development mode
node bin/cli.js
```

### Requirements

- Node.js >= 16.0.0
- Ollama installed and running
- SAGE model downloaded
- pdftotext (from poppler-utils) for PDF processing

## Contributing

We welcome contributions to INSCRIBE! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Support for more paper formats (arXiv, IEEE, ACM)
- [ ] Multi-language code generation (JavaScript, Go, Rust)
- [ ] Interactive paper exploration and questioning
- [ ] Batch processing of multiple papers
- [ ] Integration with code editors and IDEs
- [ ] Custom implementation templates and styles

---

<div align="center">

[![Made by SAGEA](https://img.shields.io/badge/Made%20by-SAGEA-blue?style=for-the-badge)](https://sagea.space)

</div>
