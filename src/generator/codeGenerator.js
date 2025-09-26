import { OllamaClient } from "../ollama/client.js";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

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
    } = options;

    try {
      console.log(chalk.blue("🔄 Starting code generation..."));
      console.log(
        chalk.gray(`Paper: ${paperAnalysis.title || "Unknown Paper"}`)
      );

      console.log(
        chalk.yellow("📝 Generating comprehensive implementation...")
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
        documentation: null,
      };

      console.log(
        chalk.gray(
          "⏭️  Skipping tests and examples (focusing on implementation)"
        )
      );

      console.log(chalk.yellow("📄 Generating documentation..."));
      components.documentation = await this.generateDocumentation(
        codeResult,
        paperAnalysis
      );

      const outputPath = await this.saveImplementation(
        components,
        outputDir,
        fileName || paperAnalysis.title
      );

      console.log(chalk.green("✅ Code generation completed successfully!"));

      return {
        success: true,
        components,
        outputPath,
        files: this.getGeneratedFilesList(outputPath),
        message: `Implementation generated successfully in ${outputPath}`,
      };
    } catch (error) {
      console.error(chalk.red(`❌ Code generation failed: ${error.message}`));
      return {
        success: false,
        error: error.message,
        components: null,
        outputPath: null,
        files: [],
      };
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

    console.log(chalk.green(`📁 Files saved to: ${fullOutputDir}`));
    files.forEach((file) => {
      console.log(chalk.gray(`   └─ ${path.basename(file)}`));
    });

    return fullOutputDir;
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
      "os",
      "sys",
      "math",
      "random",
      "time",
      "datetime",
      "json",
      "collections",
      "itertools",
      "functools",
      "re",
      "copy",
      "pickle",
      "pathlib",
      "typing",
      "unittest",
      "logging",
    ]);

    while ((match = importRegex.exec(code)) !== null) {
      const module = match[1] || match[2];
      if (module && !stdLibModules.has(module)) {
        const packageMap = {
          numpy: "numpy",
          pandas: "pandas",
          matplotlib: "matplotlib",
          seaborn: "seaborn",
          sklearn: "scikit-learn",
          cv2: "opencv-python",
          PIL: "Pillow",
          requests: "requests",
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

      const { execa } = await import("execa");
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
      console.log(chalk.yellow("🔍 Validating generated code..."));
      const validation = await this.validateCode(result.components.main);

      result.validation = validation;

      if (validation.valid) {
        console.log(chalk.green("✅ Code validation passed"));
      } else {
        console.log(chalk.red("❌ Code validation failed"));
        console.log(chalk.red("Errors:", validation.errors.join(", ")));
      }
    }

    return result;
  }
}
