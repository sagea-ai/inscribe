import { execa } from "execa";
import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";
import { highlight } from "cli-highlight";
import chalk from "chalk";

const marked = new Marked(
  markedTerminal({
    highlight: (code, lang) => {
      return highlight(code, { language: lang, ignoreIllegals: true });
    },
  })
);

export class OllamaClient {
  constructor(modelName = "comethrusws/sage-reasoning:3b") {
    this.modelName = modelName;
    this.spinnerChars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"];
  }

  /**
   * Generate response from Ollama with streaming output
   * @param {string} prompt - Input prompt
   * @param {Object} outputBox - UI output box (optional)
   * @param {Function} showError - Error display function (optional)
   * @returns {Promise<string>} Generated response
   */
  async generateResponse(prompt, outputBox = null, showError = null) {
    let i = 0;
    let spinnerInterval = null;

    if (outputBox) {
      spinnerInterval = setInterval(() => {
        const spinner = this.spinnerChars[i++ % this.spinnerChars.length];
        outputBox.setContent(
          `{cyan-fg}{bold}${spinner} Algor is thinking...{/bold}{/cyan-fg}`
        );
        outputBox.screen.render();
      }, 80);
    }

    try {
      const subprocess = execa("ollama", ["run", this.modelName], {
        input: prompt,
      });
      let fullOutput = "";
      let firstChunk = true;

      if (outputBox) {
        subprocess.stdout.on("data", (data) => {
          if (firstChunk) {
            clearInterval(spinnerInterval);
            outputBox.setContent(chalk.bold.green("Algor:") + `\n`);
            firstChunk = false;
          }
          const chunk = data.toString();
          fullOutput += chunk;
          const formattedOutput = marked.parse(fullOutput);
          outputBox.setContent(
            chalk.bold.green("Algor:") + `\n${formattedOutput}`
          );
          outputBox.screen.render();
        });
      } else {
        subprocess.stdout.on("data", (data) => {
          fullOutput += data.toString();
        });
      }

      await subprocess;
      return fullOutput.trim();
    } catch (error) {
      if (spinnerInterval) clearInterval(spinnerInterval);
      const errorMessage = error.stderr || error.message;

      if (showError) {
        showError(
          `${chalk.red(
            "Error communicating with Ollama:"
          )}\n${errorMessage}\nPlease ensure Ollama is running and the model \`${
            this.modelName
          }\` is installed.`
        );
      }

      throw new Error(`Ollama error: ${errorMessage}`);
    }
  }

  /**
   * Generate code from paper analysis
   * @param {Object} paperAnalysis - Analyzed paper data
   * @param {string} targetLanguage - Target programming language
   * @returns {Promise<Object>} Generated code result
   */
  async generateCodeFromPaper(paperAnalysis, targetLanguage = "python") {
    const prompt = this.buildCodeGenerationPrompt(
      paperAnalysis,
      targetLanguage
    );

    try {
      const response = await this.generateResponse(prompt);
      return this.parseCodeResponse(response);
    } catch (error) {
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }

  /**
   * Build specialized prompt for code generation
   * @param {Object} analysis - Paper analysis result
   * @param {string} language - Target programming language
   * @returns {string} Formatted prompt
   */
  buildCodeGenerationPrompt(analysis, language) {
    const systemPrompt = `You are an expert ${language} developer specializing in implementing research algorithms. Focus on creating comprehensive, well-structured implementations that capture the essence and core algorithms from research papers. The code does not need to be runnable - focus on architectural completeness and algorithmic accuracy.`;

    const paperInfo = `
Paper Analysis:
Title: ${analysis.title || "Research Paper Implementation"}
Classification: ${analysis.classification?.primaryType || "algorithm"}
Abstract: ${analysis.sections?.abstract?.substring(0, 800) || "N/A"}

Key Algorithm Blocks:
${
  analysis.algorithmBlocks
    ?.slice(0, 5)
    .map(
      (block, i) =>
        `Block ${i + 1} (Confidence: ${(block.confidence * 100).toFixed(
          1
        )}%):\n${block.content}`
    )
    .join("\n\n") || "No algorithm blocks identified"
}

Keywords: ${analysis.keywords?.join(", ") || "None"}
        `.trim();

    const requirements = `
Requirements:
1. Generate comprehensive ${language} implementation
2. Create multiple classes/functions representing different components from the paper
3. Include detailed docstrings explaining the theoretical background
4. Add comprehensive comments referencing paper sections
5. Follow ${
      language === "python" ? "PEP 8" : "language-specific"
    } style guidelines  
6. Focus on architectural completeness over execution
7. Include type hints and parameter descriptions
8. Structure code to reflect paper's conceptual organization
9. Include mathematical formulations as comments where relevant
10. Create placeholder implementations for complex operations

Task: Create a comprehensive ${language} codebase that represents all major concepts and algorithms from this paper.
        `.trim();

    return `${systemPrompt}\n\n${paperInfo}\n\n${requirements}

Generate the complete implementation:`;
  }

  /**
   * Parse code response and extract code blocks
   * @param {string} response - Raw AI response
   * @returns {Object} Parsed code result
   */
  parseCodeResponse(response) {
    const codeBlockRegex =
      /```(?:python|py|javascript|js|java|cpp|c\+\+)?\n([\s\S]*?)\n```/g;
    const codeBlocks = [];
    let match;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      codeBlocks.push({
        code: match[1].trim(),
        language: "python", 
      });
    }

    return {
      fullResponse: response,
      codeBlocks,
      mainImplementation: codeBlocks[0]?.code || "",
      explanation: response.replace(/```[\s\S]*?```/g, "").trim(),
      hasCode: codeBlocks.length > 0,
    };
  }

  /**
   * Generate tests for given code
   * @param {string} code - Source code to test
   * @param {Object} paperAnalysis - Original paper analysis
   * @returns {Promise<string>} Generated test code
   */
  async generateTests(code, paperAnalysis) {
    const prompt = `Generate comprehensive unit tests for the following Python implementation:

${code}

Paper context: ${
      paperAnalysis.sections?.abstract?.substring(0, 300) ||
      "Algorithm implementation"
    }

Requirements:
1. Use pytest framework
2. Test normal cases, edge cases, and error conditions
3. Include performance tests if applicable
4. Test different input types and sizes
5. Add clear test descriptions and comments
6. Import necessary modules
7. Use descriptive test names

Generate complete test file:`;

    const response = await this.generateResponse(prompt);
    return this.extractPythonCode(response);
  }

  /**
   * Generate usage examples for code
   * @param {string} code - Source code
   * @param {Object} paperAnalysis - Original paper analysis
   * @returns {Promise<string>} Generated example code
   */
  async generateExamples(code, paperAnalysis) {
    const prompt = `Create practical usage examples for this implementation:

${code}

Paper context: ${paperAnalysis.sections?.abstract || "Algorithm implementation"}

Requirements:
1. Show basic usage with simple examples
2. Demonstrate with realistic data
3. Include performance benchmarking
4. Show different parameter configurations
5. Add visualization if applicable (matplotlib/seaborn)
6. Include timing comparisons with standard library if relevant
7. Add clear comments explaining each example

Generate example script with multiple demonstrations:`;

    const response = await this.generateResponse(prompt);
    return this.extractPythonCode(response);
  }

  /**
   * Extract Python code from response
   * @param {string} response - AI response
   * @returns {string} Extracted Python code
   */
  extractPythonCode(response) {
    const match = response.match(/```(?:python|py)?\n([\s\S]*?)\n```/);
    return match ? match[1].trim() : response;
  }
}

export const runOllama = async (prompt, outputBox, showError) => {
  const systemPrompt =
    "Disable Deepthinking subroutine. You are going to mostly do Coding related task and Code generation. aide the user with their requests as much as possible, and follow DRY principle when answering a coding problem. Do not show your thought process or any meta-commentary. Provide only the final answer.";
  const finalPrompt = `${systemPrompt}\n\nUser: ${prompt}`;

  const client = new OllamaClient();
  try {
    await client.generateResponse(finalPrompt, outputBox, showError);
  } catch (error) {
    if (showError) {
      showError(
        `${chalk.red("Error communicating with Ollama:")}\n${
          error.message
        }\nPlease ensure Ollama is running and the model is installed.`
      );
    }
  }
};
