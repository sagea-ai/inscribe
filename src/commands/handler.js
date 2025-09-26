import chalk from "chalk";
import { runOllama } from "../ollama/client.js";
import { createRequire } from "module";
import fs from "fs/promises";
import { execa } from "execa";
import path from "path";
import { PaperParser } from "../paper/parser.js";
import { PaperAnalyzer } from "../paper/analyzer.js";
import { CodeGenerator } from "../generator/codeGenerator.js";

const require = createRequire(import.meta.url);
const packageJson = require("../../package.json");

const paperParser = new PaperParser();
const paperAnalyzer = new PaperAnalyzer();
const codeGenerator = new CodeGenerator();

const context = {
  paperAnalysis: null,
  setStatus: (status) => {
    console.log(chalk.blue(status));
  },
};

export const handleCommand = async (
  line,
  outputBox,
  showError,
  quickStartContent
) => {
  const parts = line.trim().split(" ");
  const command = parts[0];
  const args = parts.slice(1);

  switch (command) {
    case "/help":
      const helpMessage = `
🤖 {bold}SAGE ALGOR - Paper to Code Assistant{/bold}

{bold}Paper Processing:{/bold}
  {cyan-fg}/paper <path>{/cyan-fg}    - Load and analyze a PDF paper
  {cyan-fg}/analyze{/cyan-fg}         - Show detailed paper analysis
  {cyan-fg}/generate{/cyan-fg}        - Generate Python implementation

{bold}File Operations:{/bold}
  {cyan-fg}/edit <file>{/cyan-fg}     - Load file content into context
  {cyan-fg}/run <command>{/cyan-fg}   - Execute shell commands

{bold}Utilities:{/bold}
  {cyan-fg}/help{/cyan-fg}            - Show this help message
  {cyan-fg}/about{/cyan-fg}           - Version information  
  {cyan-fg}/clear{/cyan-fg}           - Clear context
  {cyan-fg}/clean{/cyan-fg}           - Clear screen
  {cyan-fg}exit{/cyan-fg} or {cyan-fg}/quit{/cyan-fg}    - Exit application

{bold}Example Workflow:{/bold}
  1. {yellow-fg}/paper ./research/quicksort.pdf{/yellow-fg}
  2. {yellow-fg}/analyze{/yellow-fg} (optional - review extracted content)
  3. {yellow-fg}/generate{/yellow-fg} (creates Python implementation)

{bold}Chat:{/bold}
Type your message to chat with SAGE AI about the loaded paper or ask coding questions.

{bold}Keyboard Shortcuts:{/bold}
  Ctrl+C, q, escape  - Quit application
  Ctrl+L             - Clear the screen
  Up/Down Arrows     - Navigate command history
  Enter              - Send message
`;
      outputBox.setContent(helpMessage);
      break;
    case "/about":
      outputBox.setContent(`SAGE Algor CLI version ${packageJson.version}`);
      break;
    case "/clear":
      outputBox.setContent(quickStartContent);
      break;
    case "/clean":
      outputBox.setContent("");
      break;
    case "/edit":
      if (args.length === 0) {
        outputBox.setContent(chalk.red("Please provide a file path."));
        break;
      }
      const filePath = path.resolve(process.cwd(), args[0]);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        outputBox.setContent(
          chalk.bold.cyan(`Content of ${filePath}:\n\n`) + content
        );
      } catch (error) {
        showError(chalk.red(`Error reading file: ${error.message}`));
      }
      break;
    case "/run":
      if (args.length === 0) {
        outputBox.setContent(chalk.red("Please provide a command to run."));
        break;
      }
      const cmd = args[0];
      const cmdArgs = args.slice(1);
      try {
        const { stdout, stderr } = await execa(cmd, cmdArgs);
        if (stderr) {
          showError(chalk.red(`Command error:\n${stderr}`));
        } else {
          outputBox.setContent(
            chalk.bold.cyan(`Output of '${line}':\n\n`) + stdout
          );
        }
      } catch (error) {
        showError(chalk.red(`Command failed:\n${error.message}`));
      }
      break;
    case "/test":
      outputBox.setContent(
        chalk.blue(`Testing ${args.join(" ")}... (Not implemented)`)
      );
      break;
    case "/paper":
      await handlePaperCommand(args, outputBox, showError);
      break;
    case "/analyze":
      await handleAnalyzeCommand(args, outputBox, showError);
      break;
    case "/generate":
      await handleGenerateCommand(args, outputBox, showError);
      break;
    case "/history":
      outputBox.setContent(
        chalk.blue("Displaying history... (Not implemented)")
      );
      break;
    case "exit":
    case "/quit":
      return process.exit(0);
    default:
      outputBox.setContent(
        chalk.bold.cyan("You:") +
          `
${line}
`
      );
      return runOllama(line, outputBox, showError);
  }
  outputBox.screen.render();
};

// Helper functions for new commands
async function handlePaperCommand(args, outputBox, showError) {
  if (args.length === 0) {
    outputBox.setContent(
      chalk.red(
        "Usage: /paper <path-to-pdf>\nExample: /paper ./test_data/1706.03762v7.pdf"
      )
    );
    return;
  }

  const pdfPath = path.resolve(process.cwd(), args[0]);

  try {
    outputBox.setContent(
      `{cyan-fg}{bold}📄 Processing PDF...{/bold}{/cyan-fg}`
    );
    outputBox.screen.render();
    const parseResult = await paperParser.processPDF(pdfPath);

    if (!parseResult.success) {
      throw new Error(parseResult.error);
    }

    const analysis = paperAnalyzer.analyzeStructure(
      parseResult.content.cleaned
    );

    context.paperAnalysis = {
      ...analysis,
      metadata: parseResult.metadata,
      statistics: parseResult.statistics,
      pages: parseResult.content.pages,
    };

    const message = `📄 **Paper Loaded Successfully**

**Title:** ${analysis.title}
**Pages:** ${parseResult.content.pages}
**Classification:** ${analysis.classification.primaryType}
**Sections Found:** ${Object.keys(analysis.sections).length}
**Algorithm Blocks:** ${analysis.algorithmBlocks.length}

**Top Keywords:** ${analysis.keywords.slice(0, 8).join(", ")}

Use \`/analyze\` to view detailed analysis or \`/generate\` to create implementation.`;

    outputBox.setContent(message);
  } catch (error) {
    showError(chalk.red(`Failed to process PDF: ${error.message}`));
  }
}

async function handleAnalyzeCommand(args, outputBox, showError) {
  if (!context.paperAnalysis) {
    outputBox.setContent(
      chalk.red("No paper loaded. Use `/paper <path>` first.")
    );
    return;
  }

  const analysis = context.paperAnalysis;

  let message = `📊 **Paper Analysis**

**Title:** ${analysis.title}
**Classification:** ${analysis.classification.primaryType} (${
    analysis.classification.confidence
  } confidence)
**Pages:** ${analysis.pages || "Unknown"}

**Sections (${Object.keys(analysis.sections).length}):**
${Object.entries(analysis.sections)
  .map(([section, content]) => `• ${section}: ${content.length} characters`)
  .join("\n")}

**Algorithm Blocks Found:** ${analysis.algorithmBlocks.length}`;

  if (analysis.algorithmBlocks.length > 0) {
    message += "\n\n**Top Algorithm Blocks:**";
    analysis.algorithmBlocks.slice(0, 3).forEach((block, i) => {
      message += `\n\n**Block ${i + 1}** (Confidence: ${(
        block.confidence * 100
      ).toFixed(1)}%)
Keywords: ${block.keywords.join(", ")}
${block.content.substring(0, 200)}...`;
    });
  }

  if (analysis.statistics) {
    message += `\n\n**Statistics:**
• Total words: ${analysis.statistics.totalWords}
• Unique words: ${analysis.statistics.uniqueWords}
• Sentences: ${analysis.statistics.totalSentences}`;
  }

  outputBox.setContent(message);
}

async function handleGenerateCommand(args, outputBox, showError) {
  if (!context.paperAnalysis) {
    outputBox.setContent(
      chalk.red("No paper loaded. Use `/paper <path>` first.")
    );
    return;
  }

  try {
    outputBox.setContent(
      `{cyan-fg}{bold}🔄 Generating Python implementation...{/bold}{/cyan-fg}\n{gray-fg}This may take a few minutes...{/gray-fg}`
    );
    outputBox.screen.render();

    const options = {
      language: "python",
      includeTests: false,
      includeExamples: false,
      outputDir: "./generated",
    };

    const result = await codeGenerator.generateImplementation(
      context.paperAnalysis,
      options
    );

    if (result.success) {
      let message = `🎉 **Implementation Generated Successfully!**

**Output Directory:** \`${result.outputPath}\`

**Files Created:**`;

      result.files.forEach((file) => {
        message += `\n• ${file.name} (${file.type})`;
      });

      if (result.validation) {
        message += `\n\n**Code Validation:** ${
          result.validation.valid ? "✅ Passed" : "❌ Failed"
        }`;
        if (!result.validation.valid) {
          message += `\nErrors: ${result.validation.errors.join(", ")}`;
        }
      }

      if (result.components.main) {
        message += `\n\n**Preview:**\n\`\`\`python\n${result.components.main.substring(
          0,
          400
        )}...\n\`\`\``;
      }

      message += `\n\n**Next Steps:**
1. Check the generated files in: \`${result.outputPath}\`
2. Install requirements: \`pip install -r requirements.txt\`
3. Run examples: \`python examples_*.py\`
4. Run tests: \`pytest test_*.py\``;

      outputBox.setContent(message);
    } else {
      showError(chalk.red(`Code generation failed: ${result.error}`));
    }
  } catch (error) {
    showError(chalk.red(`Generation error: ${error.message}`));
  }
}
