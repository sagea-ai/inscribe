# INSCRIBE Architecture Overview

This document provides a comprehensive overview of INSCRIBE's system architecture, design patterns, and technical implementation details.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        INSCRIBE                             │
├─────────────────────────────────────────────────────────────┤
│  CLI Interface (Commander.js)                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Paper     │  │    Code     │  │     UI      │       │
│  │  Analysis   │  │ Generation  │  │ Components  │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Ollama    │  │ File System │  │ Configuration│      │
│  │ Integration │  │   Manager   │  │   Manager   │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
paper_to_code/
├── bin/                    # CLI entry point
│   └── cli.js             # Main CLI application
├── src/                   # Core application code
│   ├── app.js            # Application entry point
│   ├── commands/         # CLI command handlers
│   │   └── handler.js    # Command processing logic
│   ├── generator/        # Code generation engine
│   │   ├── codeGenerator.js
│   │   └── templates/    # Code templates
│   ├── ollama/           # AI model integration
│   │   └── client.js     # Ollama API client
│   ├── paper/            # Paper processing pipeline
│   │   ├── analyzer.js   # Paper analysis engine
│   │   └── parser.js     # PDF parsing utilities
│   └── ui/               # User interface components
│       └── logo.js       # CLI visual elements
├── docs/                 # Documentation
├── generated/            # Output directory for generated code
├── test_data/           # Sample papers for testing
└── temp/                # Temporary processing files
```

## 🔄 Data Flow Architecture

### 1. Input Processing

```
PDF File → PDF Parser → Text Extraction → Content Preprocessing
```

### 2. Analysis Pipeline

```
Preprocessed Text → NLP Analysis → Structure Detection → Algorithm Extraction
```

### 3. AI Processing

```
Extracted Content → Ollama API → AI Model Processing → Code Structure Planning
```

### 4. Code Generation

```
Code Plan → Template Engine → Code Generation → File System Output
```

## 🧩 Core Components

### CLI Interface (`bin/cli.js`)

The main entry point that handles:

- Command-line argument parsing
- User input validation
- Command routing to appropriate handlers
- Error handling and user feedback

```javascript
// CLI Architecture Pattern
const program = require("commander");

program
  .version(packageJson.version)
  .description("AI-powered paper-to-code generation tool")
  .option("--paper <path>", "Path to research paper PDF")
  .option("--language <lang>", "Target programming language")
  .option("--output <dir>", "Output directory")
  .action(async (options) => {
    await handlePaperProcessing(options);
  });
```

### Paper Analysis Engine (`src/paper/`)

**Parser (`parser.js`)**

- PDF text extraction using `pdftotext`
- Content preprocessing and cleaning
- Format normalization

**Analyzer (`analyzer.js`)**

- NLP-based content analysis
- Section identification and classification
- Algorithm detection and extraction
- Confidence scoring for generated insights

```javascript
// Analysis Pipeline Architecture
class PaperAnalyzer {
  async analyzeStructure(content) {
    const sections = await this.identifySections(content);
    const algorithms = await this.extractAlgorithms(sections);
    const confidence = await this.calculateConfidence(algorithms);

    return {
      sections,
      algorithms,
      confidence,
      metadata: this.extractMetadata(content),
    };
  }
}
```

### Code Generation Engine (`src/generator/`)

**Code Generator (`codeGenerator.js`)**

- Template-based code generation
- Language-specific code formatting
- Dependency management
- Test case generation

**Template System (`templates/`)**

- Modular template architecture
- Language-specific templates
- Customizable code patterns
- Framework integration templates

```javascript
// Code Generation Architecture
class CodeGenerator {
  constructor(language, templates) {
    this.language = language;
    this.templateEngine = new TemplateEngine(templates);
  }

  async generateCode(analysis) {
    const codeStructure = await this.planCodeStructure(analysis);
    const generatedFiles = await this.generateFiles(codeStructure);
    return this.formatAndValidate(generatedFiles);
  }
}
```

### AI Integration (`src/ollama/`)

**Ollama Client (`client.js`)**

- Connection management to Ollama service
- Model loading and configuration
- Request/response handling
- Error recovery and retry logic

```javascript
// AI Integration Architecture
class OllamaClient {
  constructor(options = {}) {
    this.host = options.host || "localhost";
    this.port = options.port || 11434;
    this.model = options.model || "sage-reasoning:3b";
  }

  async generateCode(prompt, context) {
    const response = await this.sendRequest({
      model: this.model,
      prompt: this.buildPrompt(prompt, context),
      stream: false,
    });

    return this.parseCodeResponse(response);
  }
}
```

## 🎯 Design Patterns

### 1. Strategy Pattern (Code Generation)

Different code generation strategies for different languages:

```javascript
class CodeGenerationStrategy {
  generate(analysis) {
    throw new Error("Must implement generate method");
  }
}

class PythonStrategy extends CodeGenerationStrategy {
  generate(analysis) {
    // Python-specific generation logic
  }
}

class JavaScriptStrategy extends CodeGenerationStrategy {
  generate(analysis) {
    // JavaScript-specific generation logic
  }
}
```

### 2. Pipeline Pattern (Paper Processing)

Sequential processing stages with clear interfaces:

```javascript
class ProcessingPipeline {
  constructor() {
    this.stages = [];
  }

  addStage(stage) {
    this.stages.push(stage);
    return this;
  }

  async process(input) {
    let result = input;
    for (const stage of this.stages) {
      result = await stage.process(result);
    }
    return result;
  }
}

// Usage
const pipeline = new ProcessingPipeline()
  .addStage(new PDFParsingStage())
  .addStage(new ContentAnalysisStage())
  .addStage(new AlgorithmExtractionStage())
  .addStage(new CodeGenerationStage());
```

### 3. Factory Pattern (Template Creation)

Dynamic template creation based on language and type:

```javascript
class TemplateFactory {
  static createTemplate(language, type) {
    const key = `${language}_${type}`;

    switch (key) {
      case "python_ml":
        return new PythonMLTemplate();
      case "python_algorithm":
        return new PythonAlgorithmTemplate();
      case "javascript_web":
        return new JavaScriptWebTemplate();
      default:
        throw new Error(`Unknown template type: ${key}`);
    }
  }
}
```

### 4. Observer Pattern (Progress Tracking)

Event-driven progress updates throughout the processing pipeline:

```javascript
class ProcessingEventEmitter extends EventEmitter {
  emitProgress(stage, progress, message) {
    this.emit("progress", {
      stage,
      progress,
      message,
      timestamp: new Date(),
    });
  }
}

// Usage
processor.on("progress", (event) => {
  console.log(`${event.stage}: ${event.progress}% - ${event.message}`);
});
```

## 🔒 Security Architecture

### Input Validation

- PDF file validation and sanitization
- Path traversal prevention
- File size limits and type checking
- Command injection prevention

### AI Model Security

- Request sanitization for Ollama API
- Response validation and filtering
- Model output sandboxing
- Rate limiting and timeout management

### Generated Code Security

- Code injection prevention
- Safe template rendering
- Output validation
- Dependency vulnerability scanning

## ⚡ Performance Architecture

### Caching Strategy

```javascript
class CacheManager {
  constructor() {
    this.analysisCache = new Map();
    this.templateCache = new Map();
  }

  async getOrAnalyze(paperHash, analysisFunction) {
    if (this.analysisCache.has(paperHash)) {
      return this.analysisCache.get(paperHash);
    }

    const result = await analysisFunction();
    this.analysisCache.set(paperHash, result);
    return result;
  }
}
```

### Streaming Processing

- Large PDF handling with streaming
- Progressive analysis updates
- Memory-efficient processing
- Chunked AI model requests

### Concurrent Processing

```javascript
class ConcurrentProcessor {
  async processInParallel(tasks, concurrency = 3) {
    const chunks = this.chunkArray(tasks, concurrency);
    const results = [];

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((task) => this.processTask(task))
      );
      results.push(...chunkResults);
    }

    return results;
  }
}
```

## 🔧 Configuration Architecture

### Hierarchical Configuration

```
System Defaults → Global Config → Project Config → CLI Arguments
```

### Configuration Schema

```javascript
const configSchema = {
  defaultLanguage: "string",
  outputDirectory: "string",
  aiModel: "string",
  templates: {
    includeDocstrings: "boolean",
    addTypeHints: "boolean",
    generateTests: "boolean",
  },
  ollama: {
    host: "string",
    port: "number",
    timeout: "number",
  },
};
```

## 🚦 Error Handling Architecture

### Error Classification

```javascript
class INSCRIBEError extends Error {
  constructor(message, type, code) {
    super(message);
    this.type = type;
    this.code = code;
    this.timestamp = new Date();
  }
}

class PDFProcessingError extends INSCRIBEError {
  constructor(message) {
    super(message, "PDF_PROCESSING", "E001");
  }
}

class AIModelError extends INSCRIBEError {
  constructor(message) {
    super(message, "AI_MODEL", "E002");
  }
}
```

### Error Recovery Strategies

- Automatic retry with exponential backoff
- Graceful degradation for non-critical features
- User-friendly error messages with solutions
- Comprehensive logging for debugging

## 📊 Monitoring and Observability

### Logging Architecture

```javascript
const logger = {
  info: (message, context) => log("INFO", message, context),
  warn: (message, context) => log("WARN", message, context),
  error: (message, context) => log("ERROR", message, context),
  debug: (message, context) => log("DEBUG", message, context),
};
```

### Metrics Collection

- Processing time metrics
- Success/failure rates
- AI model performance
- User interaction patterns

## 🔄 Extension Architecture

### Plugin System Design

```javascript
class PluginManager {
  constructor() {
    this.plugins = new Map();
  }

  registerPlugin(name, plugin) {
    if (this.validatePlugin(plugin)) {
      this.plugins.set(name, plugin);
    }
  }

  async executeHook(hookName, context) {
    const results = [];
    for (const [name, plugin] of this.plugins) {
      if (plugin.hooks && plugin.hooks[hookName]) {
        const result = await plugin.hooks[hookName](context);
        results.push({ plugin: name, result });
      }
    }
    return results;
  }
}
```

### Available Extension Points

- Custom paper parsers
- Additional AI model integrations
- Custom code templates
- Output format processors
- Analysis enhancement plugins

## 🔮 Future Architecture Considerations

### Microservices Migration

- Service separation by domain
- API-first architecture
- Container deployment
- Service mesh integration

### Distributed Processing

- Queue-based processing
- Worker node scaling
- Distributed caching
- Load balancing

### Real-time Features

- WebSocket connections
- Live progress updates
- Collaborative editing
- Real-time code refinement

---

This architecture provides a solid foundation for INSCRIBE's current capabilities while maintaining flexibility for future enhancements and scaling requirements.

---

**Last Updated**: September 28, 2025  
**Architecture Version**: 1.0
