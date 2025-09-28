import { OllamaClient } from "../ollama/client.js";
import fs from "fs-extra";
import path from "path";
import { execa } from "execa";

export class CodeGenerator {
  constructor() {
    this.ollama = new OllamaClient();
    this.templatesDir = path.join(
      process.cwd(),
      "src",
      "generator",
      "templates"
    );
  }

  /**
   * Generate complete implementation from paper analysis
   * @param {Object} paperAnalysis - Analyzed paper data
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generation result
   */
  async generateImplementation(paperAnalysis, options = {}) {
    const {
      language = "python",
      includeTests = false,
      includeExamples = false,
      outputDir = "./generated",
      fileName = null,
      createVenv = true,
      installRequirements = true,
    } = options;

    try {
      // Use simple console output instead of chalk for internal operations
      const outputPath = await this.saveImplementation(
        { main: "# Placeholder", documentation: "# Placeholder" },
        outputDir,
        fileName || paperAnalysis.title
      );

      const codeResult = await this.ollama.generateCodeFromPaper(
        paperAnalysis,
        language
      );

      if (!codeResult.hasCode) {
        throw new Error("No code was generated from the paper analysis");
      }

      const components = {
        main: codeResult.mainImplementation,
        explanation: codeResult.explanation,
        tests: null,
        examples: null,
        documentation: await this.generateDocumentation(codeResult, paperAnalysis),
      };

      // Update files with actual content
      await this.updateImplementationFiles(outputPath, components, paperAnalysis.title);

      let venvCreated = false;
      let requirementsInstalled = false;

      // Create virtual environment
      if (createVenv) {
        venvCreated = await this.createVirtualEnvironment(outputPath);
      }

      // Install requirements
      if (venvCreated && installRequirements) {
        requirementsInstalled = await this.installRequirements(outputPath);
      }

      return {
        success: true,
        components,
        outputPath,
        files: this.getGeneratedFilesList(outputPath),
        message: `Implementation generated successfully in ${outputPath}`,
        venvCreated,
        requirementsInstalled,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        components: null,
        outputPath: null,
        files: [],
        venvCreated: false,
        requirementsInstalled: false,
      };
    }
  }

  /**
   * Update implementation files with actual content
   * @param {string} outputPath - Output directory path
   * @param {Object} components - Generated components
   * @param {string} title - Paper title
   */
  async updateImplementationFiles(outputPath, components, title) {
    const safeName = this.createSafeFileName(title);

    if (components.main) {
      const mainFile = path.join(outputPath, `${safeName}.py`);
      await fs.writeFile(mainFile, components.main);
    }

    if (components.documentation) {
      const docFile = path.join(outputPath, "README.md");
      await fs.writeFile(docFile, components.documentation);
    }

    // Update requirements.txt with actual requirements
    const requirements = this.extractRequirements(components.main);
    if (requirements.length > 0) {
      const reqFile = path.join(outputPath, "requirements.txt");
      await fs.writeFile(reqFile, requirements.join("\n"));
    }
  }

  /**
   * Generate comprehensive documentation
   * @param {Object} codeResult - Generated code result
   * @param {Object} paperAnalysis - Original paper analysis
   * @returns {Promise<string>} Generated documentation
   */
  async generateDocumentation(codeResult, paperAnalysis) {
    const title = paperAnalysis.title || "Algorithm Implementation";
    const classification =
      paperAnalysis.classification?.primaryType || "algorithm";
    const keywords = paperAnalysis.keywords?.join(", ") || "None";

    const docTemplate = `# ${title}

## Overview

This implementation is based on the research paper: **${title}**

**Classification:** ${classification}
**Keywords:** ${keywords}

## Paper Summary

${paperAnalysis.sections?.abstract || "No abstract available"}

## Algorithm Analysis

The paper describes ${
      paperAnalysis.algorithmBlocks?.length || 0
    } main algorithm block(s):

${
  paperAnalysis.algorithmBlocks
    ?.slice(0, 3)
    .map(
      (block, i) =>
        `### Algorithm Block ${i + 1}
**Confidence:** ${(block.confidence * 100).toFixed(1)}%
**Keywords:** ${block.keywords?.join(", ") || "None"}

${block.content.substring(0, 300)}...
`
    )
    .join("\n") || "No algorithm blocks identified"
}

## Implementation Details

${
  codeResult.explanation ||
  "Implementation generated automatically from paper analysis."
}

## Usage

See \`examples_*.py\` for detailed usage examples.

## Testing

Run tests with:
\`\`\`bash
pytest test_*.py -v
\`\`\`

## Requirements

- Python 3.7+
- Standard library modules as imported in the code

## Generated Files

- \`*.py\` - Main implementation
- \`test_*.py\` - Unit tests
- \`examples_*.py\` - Usage examples
- \`README.md\` - This documentation

## Paper Information

**Sections Found:** ${Object.keys(paperAnalysis.sections || {}).join(", ")}
**Algorithm Blocks:** ${paperAnalysis.algorithmBlocks?.length || 0}
**Classification Confidence:** ${
      paperAnalysis.classification?.confidence || "unknown"
    }

---

*This implementation was automatically generated from the research paper using INSCRIBE.*
`;

    return docTemplate;
  }

  /**
   * Create a virtual environment for the project
   * @param {string} projectPath - Path to the project directory
   * @returns {Promise<boolean>} Success status
   */
  async createVirtualEnvironment(projectPath) {
    try {
      const venvPath = path.join(projectPath, "venv");
      
      // Check if venv already exists
      const venvExists = await fs.pathExists(venvPath);
      if (venvExists) {
        return true;
      }

      // Check if Python is available and get the right command
      let pythonCmd = "python";
      try {
        await execa("python", ["--version"]);
      } catch (error) {
        try {
          await execa("python3", ["--version"]);
          pythonCmd = "python3";
        } catch (error2) {
          throw new Error("Neither 'python' nor 'python3' command found. Please install Python.");
        }
      }

      // Create virtual environment
      await execa(pythonCmd, ["-m", "venv", venvPath]);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Install requirements in the virtual environment
   * @param {string} projectPath - Path to the project directory
   * @returns {Promise<boolean>} Success status
   */
  async installRequirements(projectPath) {
    try {
      const venvPath = path.join(projectPath, "venv");
      const requirementsPath = path.join(projectPath, "requirements.txt");
      
      // Check if requirements.txt exists and has content
      const requirementsExist = await fs.pathExists(requirementsPath);
      if (!requirementsExist) {
        return false;
      }

      const requirementsContent = await fs.readFile(requirementsPath, 'utf8');
      if (!requirementsContent.trim()) {
        return false;
      }

      // Determine the correct Python executable
      const isWindows = process.platform === "win32";
      const pythonExe = isWindows 
        ? path.join(venvPath, "Scripts", "python.exe")
        : path.join(venvPath, "bin", "python");

      // Check if the python executable exists in venv
      const pythonExists = await fs.pathExists(pythonExe);
      if (!pythonExists) {
        return false;
      }

      // Upgrade pip first
      await execa(pythonExe, ["-m", "pip", "install", "--upgrade", "pip"]);
      
      // Install requirements
      await execa(pythonExe, ["-m", "pip", "install", "-r", requirementsPath]);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save implementation to files
   * @param {Object} components - Generated components
   * @param {string} outputDir - Output directory
   * @param {string} title - Paper title for file naming
   * @returns {Promise<string>} Full output path
   */
  async saveImplementation(components, outputDir, title) {
    const safeName = this.createSafeFileName(title);
    const fullOutputDir = path.resolve(outputDir, safeName);

    await fs.ensureDir(fullOutputDir);

    const files = [];

    if (components.main) {
      const mainFile = path.join(fullOutputDir, `${safeName}.py`);
      await fs.writeFile(mainFile, components.main);
      files.push(mainFile);
    }

    if (components.tests) {
      const testFile = path.join(fullOutputDir, `test_${safeName}.py`);
      await fs.writeFile(testFile, components.tests);
      files.push(testFile);
    }

    if (components.examples) {
      const exampleFile = path.join(fullOutputDir, `examples_${safeName}.py`);
      await fs.writeFile(exampleFile, components.examples);
      files.push(exampleFile);
    }

    if (components.documentation) {
      const docFile = path.join(fullOutputDir, "README.md");
      await fs.writeFile(docFile, components.documentation);
      files.push(docFile);
    }

    const requirements = this.extractRequirements(components.main);
    if (requirements.length > 0) {
      const reqFile = path.join(fullOutputDir, "requirements.txt");
      await fs.writeFile(reqFile, requirements.join("\n"));
      files.push(reqFile);
    }

    const initFile = path.join(fullOutputDir, "__init__.py");
    await fs.writeFile(
      initFile,
      `"""${title} - Auto-generated implementation."""\n`
    );
    files.push(initFile);

    // Create platform-specific activation scripts
    const isWindows = process.platform === "win32";
    
    if (isWindows) {
      const activateBat = this.createWindowsActivationScript(safeName);
      const activateFile = path.join(fullOutputDir, "activate.bat");
      await fs.writeFile(activateFile, activateBat);
      files.push(activateFile);
    } else {
      const activateScript = this.createActivationScript(safeName);
      const activateFile = path.join(fullOutputDir, "activate.sh");
      await fs.writeFile(activateFile, activateScript);
      await fs.chmod(activateFile, 0o755); // Make executable
      files.push(activateFile);
    }

    return fullOutputDir;
  }

  /**
   * Create Windows activation script
   * @param {string} projectName - Name of the project
   * @returns {string} Windows batch script content
   */
  createWindowsActivationScript(projectName) {
    return `@echo off
REM Activation script for ${projectName}

echo 🐍 Activating virtual environment for ${projectName}...

if exist "venv\\Scripts\\activate.bat" (
    call venv\\Scripts\\activate.bat
    echo ✅ Virtual environment activated!
    echo 📁 Project: ${projectName}
    echo 📋 Available files:
    dir *.py /b
    echo.
    echo 💡 To deactivate: deactivate
    echo 🔬 To run tests: pytest test_*.py
    echo 🚀 To run examples: python examples_*.py
) else (
    echo ❌ Virtual environment not found. Please run the generation process again.
    pause
)
`;
  }

  /**
   * Create activation script for easy environment setup
   * @param {string} projectName - Name of the project
   * @returns {string} Activation script content
   */
  createActivationScript(projectName) {
    return `#!/bin/bash
# Activation script for ${projectName}

echo "🐍 Activating virtual environment for ${projectName}..."

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source ./venv/Scripts/activate
else
    # Linux/Mac
    source ./venv/bin/activate
fi

echo "✅ Virtual environment activated!"
echo "📁 Project: ${projectName}"
echo "📋 Available files:"
ls -la *.py
echo ""
echo "💡 To deactivate: deactivate"
echo "🔬 To run tests: pytest test_*.py"
echo "🚀 To run examples: python examples_*.py"
`;
  }

  /**
   * Create a safe filename from title
   * @param {string} title - Original title
   * @returns {string} Safe filename
   */
  createSafeFileName(title) {
    if (!title) return "paper_implementation";

    return (
      title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s\-]/g, "") // Remove special chars
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/_+/g, "_") // Replace multiple underscores with single
        .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
        .substring(0, 50) || "paper_implementation"
    );
  }

  /**
   * Extract Python requirements from code
   * @param {string} code - Python code
   * @returns {Array<string>} List of requirements
   */
  extractRequirements(code) {
    if (!code) return [];

    const requirements = new Set();
    const importRegex = /^(?:from\s+(\w+)|import\s+(\w+))/gm;
    let match;

    const stdLibModules = new Set([
      "os", "sys", "math", "random", "time", "datetime", "json", "collections",
      "itertools", "functools", "re", "copy", "pickle", "pathlib", "typing",
      "unittest", "logging", "threading", "multiprocessing", "subprocess",
      "urllib", "http", "email", "html", "xml", "csv", "configparser",
      "argparse", "getopt", "shutil", "glob", "tempfile", "zipfile", "tarfile"
    ]);

    while ((match = importRegex.exec(code)) !== null) {
      const module = match[1] || match[2];
      if (module && !stdLibModules.has(module)) {
        const packageMap = {
          numpy: "numpy>=1.21.0",
          pandas: "pandas>=1.3.0", 
          matplotlib: "matplotlib>=3.4.0",
          seaborn: "seaborn>=0.11.0",
          sklearn: "scikit-learn>=1.0.0",
          cv2: "opencv-python>=4.5.0",
          PIL: "Pillow>=8.3.0",
          requests: "requests>=2.26.0",
          torch: "torch>=1.9.0",
          tensorflow: "tensorflow>=2.6.0",
          transformers: "transformers>=4.11.0",
          bert_model: "transformers>=4.11.0", // Map bert_model to transformers
        };

        requirements.add(packageMap[module] || module);
      }
    }

    return Array.from(requirements);
  }

  /**
   * Get list of generated files
   * @param {string} outputPath - Output directory path
   * @returns {Array<string>} List of generated files
   */
  getGeneratedFilesList(outputPath) {
    if (!outputPath) return [];

    try {
      const files = fs.readdirSync(outputPath);
      return files.map((file) => ({
        name: file,
        path: path.join(outputPath, file),
        type: path.extname(file).substring(1) || "file",
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Validate generated code syntax
   * @param {string} code - Python code to validate
   * @returns {Object} Validation result
   */
  async validateCode(code) {
    try {
      const tempFile = path.join(process.cwd(), "temp_validation.py");
      await fs.writeFile(tempFile, code);

      await execa("python", ["-m", "py_compile", tempFile]);
      await fs.remove(tempFile);

      return {
        valid: true,
        errors: [],
        message: "Code syntax is valid",
      };
    } catch (error) {
      try {
        await fs.remove(path.join(process.cwd(), "temp_validation.py"));
      } catch (cleanupError) {}

      return {
        valid: false,
        errors: [error.message],
        message: "Code has syntax errors",
      };
    }
  }

  /**
   * Generate code with validation
   * @param {Object} paperAnalysis - Paper analysis
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generation result with validation
   */
  async generateValidatedImplementation(paperAnalysis, options = {}) {
    const result = await this.generateImplementation(paperAnalysis, options);

    if (result.success && result.components.main) {
      const validation = await this.validateCode(result.components.main);
      result.validation = validation;
    }

    return result;
  }
}