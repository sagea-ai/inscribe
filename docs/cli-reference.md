# INSCRIBE CLI Reference

Complete command-line interface reference for INSCRIBE - the AI-powered paper-to-code generation tool.

## 📋 Command Overview

```bash
inscribe [options] [command]
```

## 🚀 Basic Commands

### `inscribe --paper <path>`

Generate code from a research paper.

```bash
inscribe --paper "./research/attention_paper.pdf"
```

**Options:**

- `--language <lang>` - Target programming language (default: python)
- `--output <dir>` - Output directory (default: ./generated)
- `--model <model>` - AI model to use (default: sage-reasoning:3b)

### `inscribe --help`

Display help information.

```bash
inscribe --help
inscribe -h
```

### `inscribe --version`

Display version information.

```bash
inscribe --version
inscribe -v
```

## ⚙️ Configuration Commands

### `inscribe --init`

Initialize INSCRIBE configuration.

```bash
inscribe --init
inscribe --init --force  # Overwrite existing config
```

### `inscribe --config`

Manage configuration settings.

```bash
# View current configuration
inscribe --config show

# Set configuration value
inscribe --config set defaultLanguage python

# Get configuration value
inscribe --config get outputDirectory
```

## 🔍 Diagnostic Commands

### `inscribe --doctor`

Run system diagnostics.

```bash
inscribe --doctor
inscribe --doctor --verbose  # Detailed output
```

### `inscribe --check-setup`

Verify installation and setup.

```bash
inscribe --check-setup
```

### `inscribe --system-info`

Display system information.

```bash
inscribe --system-info
inscribe --system-info --output system-report.txt
```

## 📄 Paper Processing Options

### `--paper <path>`

**Required.** Path to the research paper PDF.

```bash
inscribe --paper "./papers/transformer.pdf"
inscribe --paper "/absolute/path/to/paper.pdf"
```

**Supported formats:**

- Local PDF files
- Relative and absolute paths

### `--language <language>`

Target programming language for code generation.

```bash
inscribe --paper paper.pdf --language python
inscribe --paper paper.pdf --language javascript
```

**Supported languages:**

- `python` (default) - Python with ML libraries
- `javascript` - JavaScript with TensorFlow.js (coming soon)
- `java` - Java with ML frameworks (planned)
- `cpp` - C++ with performance libraries (planned)

### `--output <directory>`

Output directory for generated code.

```bash
inscribe --paper paper.pdf --output "./my-implementation"
inscribe --paper paper.pdf --output "/absolute/path/output"
```

**Default:** `./generated`

### `--model <model>`

AI model for code generation.

```bash
inscribe --paper paper.pdf --model sage-reasoning:3b
inscribe --paper paper.pdf --model llama2:13b
```

**Available models:**

- `sage-reasoning:3b` (default) - Balanced performance and quality
- `llama2:7b` - Faster processing, lower quality
- `llama2:13b` - Higher quality, requires more resources

## 🎛️ Advanced Options

### `--verbose`

Enable verbose output with detailed progress information.

```bash
inscribe --paper paper.pdf --verbose
inscribe --paper paper.pdf -v
```

### `--debug`

Enable debug mode with comprehensive logging.

```bash
inscribe --paper paper.pdf --debug
```

### `--quiet`

Suppress all output except errors.

```bash
inscribe --paper paper.pdf --quiet
inscribe --paper paper.pdf -q
```

### `--force`

Force overwrite existing output files.

```bash
inscribe --paper paper.pdf --output "./existing-dir" --force
```

### `--dry-run`

Preview what would be generated without creating files.

```bash
inscribe --paper paper.pdf --dry-run
```

## 🧪 Code Generation Options

### `--include-tests`

Generate unit tests for the generated code.

```bash
inscribe --paper paper.pdf --include-tests
```

### `--include-docs`

Generate comprehensive documentation.

```bash
inscribe --paper paper.pdf --include-docs
```

### `--style <style>`

Code style and formatting preferences.

```bash
inscribe --paper paper.pdf --style pep8       # Python
inscribe --paper paper.pdf --style google     # Google style guide
inscribe --paper paper.pdf --style airbnb     # Airbnb style guide
```

### `--complexity <level>`

Code complexity level.

```bash
inscribe --paper paper.pdf --complexity beginner
inscribe --paper paper.pdf --complexity intermediate
inscribe --paper paper.pdf --complexity advanced
```

**Levels:**

- `beginner` - Simple, well-commented code
- `intermediate` - Balanced complexity (default)
- `advanced` - Optimized, production-ready code

### `--framework <framework>`

Target framework for code generation.

```bash
# Python frameworks
inscribe --paper paper.pdf --framework pytorch
inscribe --paper paper.pdf --framework tensorflow
inscribe --paper paper.pdf --framework scikit-learn

# JavaScript frameworks (coming soon)
inscribe --paper paper.pdf --framework tensorflow-js
```

## 🔄 Batch Processing

### `--batch <pattern>`

Process multiple papers matching a pattern.

```bash
inscribe --batch "./papers/*.pdf"
inscribe --batch "./papers/" --output "./implementations/"
```

### `--parallel <count>`

Number of parallel processing jobs.

```bash
inscribe --batch "./papers/*.pdf" --parallel 3
```

## 📊 Output Control

### `--format <format>`

Output format for generated code.

```bash
inscribe --paper paper.pdf --format module     # Single module
inscribe --paper paper.pdf --format package    # Python package
inscribe --paper paper.pdf --format notebook   # Jupyter notebook
```

### `--template <template>`

Custom code template.

```bash
inscribe --paper paper.pdf --template ./custom-template.py
inscribe --paper paper.pdf --template ml-research
```

## 🔧 Configuration File Options

### Global Configuration

Located at `~/.inscribe/config.json`:

```json
{
  "defaultLanguage": "python",
  "outputDirectory": "./generated",
  "aiModel": "sage-reasoning:3b",
  "includeTests": false,
  "includeDocumentation": true,
  "codeStyle": "pep8",
  "complexity": "intermediate"
}
```

### Project Configuration

Located at `./.inscribe.json` in project root:

```json
{
  "language": "python",
  "outputDir": "./src",
  "framework": "pytorch",
  "templates": {
    "includeTypeHints": true,
    "generateTests": true
  }
}
```

## 🌍 Environment Variables

### `INSCRIBE_MODEL`

Default AI model to use.

```bash
export INSCRIBE_MODEL="llama2:13b"
inscribe --paper paper.pdf  # Uses llama2:13b
```

### `INSCRIBE_OUTPUT_DIR`

Default output directory.

```bash
export INSCRIBE_OUTPUT_DIR="./my-implementations"
inscribe --paper paper.pdf  # Outputs to ./my-implementations
```

### `OLLAMA_HOST`

Ollama service host.

```bash
export OLLAMA_HOST="192.168.1.100"
export OLLAMA_PORT="11434"
inscribe --paper paper.pdf
```

### `DEBUG`

Enable debug logging.

```bash
DEBUG=inscribe* inscribe --paper paper.pdf
```

## 📝 Command Examples

### Basic Usage

```bash
# Simple code generation
inscribe --paper "attention_paper.pdf"

# Specify language and output
inscribe --paper "paper.pdf" --language python --output "./transformer-impl"

# Verbose output
inscribe --paper "paper.pdf" --verbose
```

### Advanced Usage

```bash
# High-quality generation with tests and docs
inscribe --paper "paper.pdf" \
  --language python \
  --model llama2:13b \
  --include-tests \
  --include-docs \
  --complexity advanced \
  --framework pytorch

# Batch processing
inscribe --batch "./research-papers/*.pdf" \
  --output "./implementations/" \
  --parallel 2 \
  --include-tests

# Custom template
inscribe --paper "paper.pdf" \
  --template "./templates/research-template.py" \
  --style google \
  --format package
```

### Development Workflow

```bash
# Preview generation
inscribe --paper "paper.pdf" --dry-run

# Generate initial implementation
inscribe --paper "paper.pdf" --complexity beginner

# Refine with advanced features
inscribe --paper "paper.pdf" \
  --complexity advanced \
  --include-tests \
  --force
```

## 🔍 Exit Codes

| Code | Description           |
| ---- | --------------------- |
| 0    | Success               |
| 1    | General error         |
| 2    | Invalid arguments     |
| 3    | File not found        |
| 4    | PDF processing error  |
| 5    | AI model error        |
| 6    | Code generation error |
| 7    | Configuration error   |

## 🆘 Getting Help

### Command Help

```bash
# General help
inscribe --help

# Command-specific help
inscribe --help --verbose

# Show examples
inscribe --examples
```

### Troubleshooting

```bash
# Diagnostic information
inscribe --doctor

# Debug mode
inscribe --paper paper.pdf --debug

# System information
inscribe --system-info
```

### Configuration Help

```bash
# Show current configuration
inscribe --config show

# Reset to defaults
inscribe --config reset

# Validate configuration
inscribe --config validate
```

---

**Pro Tips:**

- Use `--dry-run` to preview before generating
- Combine `--verbose` and `--debug` for troubleshooting
- Create project-specific `.inscribe.json` for consistent settings
- Use environment variables for CI/CD pipelines

---

**Last Updated**: September 28, 2025  
**CLI Version**: 1.0
