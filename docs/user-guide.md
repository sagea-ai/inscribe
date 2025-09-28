# INSCRIBE User Guide

Welcome to INSCRIBE - the AI-powered paper-to-code generation tool that transforms research papers into working code implementations!

## 🎯 What is INSCRIBE?

INSCRIBE is a powerful CLI tool that:

- 📄 Analyzes research papers (PDF format)
- 🧠 Uses AI to understand algorithms and methodologies
- 💻 Generates working code implementations
- 🎨 Provides clean, documented, and testable code

## 🚀 Quick Start

### Installation

```bash
# Install INSCRIBE globally
npm install -g inscribe-ai

# Or run locally
npx inscribe-ai
```

### Your First Paper-to-Code Generation

```bash
# Generate code from a research paper
inscribe --paper "path/to/research-paper.pdf" --language python

# Generate with specific output directory
inscribe --paper "attention_paper.pdf" --output "./generated/transformer" --language python
```

## 📖 Basic Usage

### Command Structure

```bash
inscribe [options] --paper <path-to-paper>
```

### Essential Options

| Option       | Description                 | Example                          |
| ------------ | --------------------------- | -------------------------------- |
| `--paper`    | Path to PDF paper           | `--paper ./papers/attention.pdf` |
| `--language` | Target programming language | `--language python`              |
| `--output`   | Output directory            | `--output ./generated`           |
| `--model`    | AI model to use             | `--model sage-reasoning:3b`      |
| `--verbose`  | Detailed output             | `--verbose`                      |

### Examples

#### Basic Python Generation

```bash
inscribe --paper "transformer_paper.pdf" --language python
```

#### Advanced Configuration

```bash
inscribe \
  --paper "deep_learning_paper.pdf" \
  --language python \
  --output "./my_project/src" \
  --model sage-reasoning:3b \
  --include-tests \
  --verbose
```

## 🛠️ Configuration

### Global Configuration

Create a configuration file at `~/.inscribe/config.json`:

```json
{
  "defaultLanguage": "python",
  "outputDirectory": "./generated",
  "aiModel": "sage-reasoning:3b",
  "includeTests": true,
  "includeDocumentation": true,
  "codeStyle": "pep8",
  "verboseOutput": false
}
```

### Per-Project Configuration

Create `.inscribe.json` in your project root:

```json
{
  "language": "python",
  "outputDir": "./src/algorithms",
  "templates": {
    "includeTypeHints": true,
    "generateTests": true,
    "addDocstrings": true
  }
}
```

## 📋 Supported Paper Types

### What Works Best

✅ **Algorithm Papers**: Machine learning, optimization, data structures
✅ **Implementation Papers**: Papers with clear algorithmic descriptions
✅ **Mathematical Papers**: Papers with formulas and equations
✅ **Computer Science Research**: AI, ML, computer vision, NLP

### Paper Quality Tips

- **Clear Structure**: Papers with well-defined sections
- **Algorithm Descriptions**: Detailed methodology sections
- **Pseudocode**: Papers containing pseudocode or algorithm boxes
- **Mathematical Formulations**: Clear mathematical notation

## 💻 Language Support

### Currently Supported Languages

| Language   | Status          | Frameworks                               |
| ---------- | --------------- | ---------------------------------------- |
| Python     | ✅ Full Support | PyTorch, TensorFlow, NumPy, Scikit-learn |
| JavaScript | 🚧 Coming Soon  | TensorFlow.js, ML5.js                    |
| Java       | 🚧 Planned      | Deeplearning4j, Weka                     |
| C++        | 🚧 Planned      | Eigen, OpenCV, LibTorch                  |

### Python Code Features

- **Framework Integration**: Automatic import of relevant libraries
- **Type Hints**: Modern Python typing support
- **Documentation**: Comprehensive docstrings
- **Error Handling**: Robust error management
- **Testing**: Unit tests with pytest
- **Code Style**: PEP 8 compliant formatting

## 🔍 How INSCRIBE Works

### 1. Paper Analysis

```
PDF Input → Text Extraction → NLP Analysis → Structure Detection
```

### 2. Algorithm Extraction

```
Content Analysis → Algorithm Identification → Method Extraction → Code Planning
```

### 3. Code Generation

```
AI Processing → Code Structure → Implementation → Testing → Documentation
```

### 4. Output Generation

```
File Creation → Code Formatting → Test Generation → Documentation
```

## 📊 Understanding Output

### Generated File Structure

```
generated/
├── README.md              # Implementation overview
├── requirements.txt       # Python dependencies
├── main_algorithm.py      # Main implementation
├── utils.py              # Helper functions
├── tests/
│   ├── test_algorithm.py # Unit tests
│   └── test_utils.py     # Utility tests
└── examples/
    └── usage_example.py  # Usage examples
```

### Code Quality Features

- **Modular Design**: Clean separation of concerns
- **Documentation**: Comprehensive inline comments
- **Error Handling**: Robust exception management
- **Type Safety**: Type hints and validation
- **Testing**: Comprehensive test coverage

## 🎛️ Advanced Features

### Custom Templates

Create custom code templates in `~/.inscribe/templates/`:

```python
# custom_ml_template.py
"""
Custom template for machine learning algorithms
"""

class {AlgorithmName}:
    """
    {AlgorithmDescription}

    Paper: {PaperTitle}
    Authors: {Authors}
    """

    def __init__(self, **kwargs):
        # Initialize algorithm parameters
        pass

    def fit(self, X, y=None):
        # Training implementation
        pass

    def predict(self, X):
        # Prediction implementation
        pass
```

### Batch Processing

Process multiple papers:

```bash
# Process all PDFs in a directory
inscribe --batch "./papers/" --output "./generated/" --language python

# Process with pattern matching
inscribe --batch "./papers/*.pdf" --output "./implementations/"
```

### Interactive Mode

```bash
# Start interactive session
inscribe --interactive

# Follow prompts for paper selection and configuration
```

## 🐛 Troubleshooting

### Common Issues

#### "Paper not found" Error

```bash
# Check file path
ls -la "path/to/paper.pdf"

# Use absolute path
inscribe --paper "/full/path/to/paper.pdf"
```

#### "AI model not available" Error

```bash
# Check Ollama installation
ollama list

# Pull required model
ollama pull sage-reasoning:3b
```

#### "Permission denied" Error

```bash
# Fix output directory permissions
chmod 755 ./generated/

# Or use different output directory
inscribe --paper "paper.pdf" --output ~/Documents/inscribe-output
```

### Debug Mode

Enable detailed logging:

```bash
inscribe --paper "paper.pdf" --debug --verbose
```

### Log Files

Check logs for detailed error information:

```bash
# View recent logs
tail -f ~/.inscribe/logs/inscribe.log

# Search for errors
grep "ERROR" ~/.inscribe/logs/inscribe.log
```

## 💡 Tips for Better Results

### Paper Selection

- Choose papers with clear algorithmic descriptions
- Prefer papers with pseudocode or algorithm boxes
- Look for implementation-focused research

### Prompt Engineering

- Use descriptive output directory names
- Specify the type of algorithm if known
- Include domain context in configuration

### Code Review

- Always review generated code before use
- Test generated implementations thoroughly
- Validate mathematical correctness
- Check for potential security issues

## 🔗 Integration Examples

### Jupyter Notebooks

```python
# Generated code can be imported directly
from generated.transformer import AttentionMechanism

# Use in your research
model = AttentionMechanism(d_model=512, num_heads=8)
output = model(input_tensor)
```

### Web Applications

```python
# Flask integration example
from flask import Flask, request, jsonify
from generated.algorithm import PaperAlgorithm

app = Flask(__name__)
algorithm = PaperAlgorithm()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    result = algorithm.predict(data['input'])
    return jsonify({'prediction': result})
```

### Research Pipelines

```python
# Integration with research workflow
import pandas as pd
from generated.data_processor import DataProcessor
from generated.model import ResearchModel

# Load and process data
processor = DataProcessor()
data = processor.load_and_preprocess('dataset.csv')

# Apply algorithm from paper
model = ResearchModel()
results = model.train_and_evaluate(data)
```

## 📚 Learning Resources

### Understanding Generated Code

- Review the generated README.md for implementation details
- Check inline comments for algorithm explanations
- Examine test files for usage examples

### Extending Generated Code

- Add new features to generated classes
- Implement additional methods
- Integrate with existing codebases

### Contributing Back

- Report issues with code generation
- Suggest improvements to templates
- Share successful implementations

## 🆘 Getting Help

### Documentation

- 📖 [Full Documentation](../docs/README.md)
- 🏗️ [Architecture Guide](./architecture.md)

### Community Support

- 💬 GitHub Discussions for questions
- 🐛 GitHub Issues for bug reports
- 📧 Email support for critical issues

### Professional Support

- 🏢 Enterprise support available
- 📞 Consulting services for complex implementations
- 🎓 Training workshops and tutorials

---

**Happy coding with INSCRIBE!** 🚀

Transform research papers into working code and accelerate your development workflow.

---

**Last Updated**: September 28, 2025  
**Version**: 1.0.0
