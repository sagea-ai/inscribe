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

  // Helper function to wrap text for terminal width
  const wrapText = (text, maxWidth = null) => {
    const termWidth = maxWidth || Math.max((outputBox.screen?.width || 80) - 8, 40);
    if (!text || typeof text !== 'string') return text;
    
    return text.split('\n').map(line => {
      if (line.length <= termWidth) return line;
      
      const words = line.split(' ');
      const wrappedLines = [];
      let currentLine = '';
      
      for (const word of words) {
        if ((currentLine + word).length <= termWidth) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) wrappedLines.push(currentLine);
          currentLine = word.length > termWidth ? word.substring(0, termWidth - 3) + '...' : word;
        }
      }
      
      if (currentLine) wrappedLines.push(currentLine);
      return wrappedLines.join('\n');
    }).join('\n');
  };

  switch (command) {
    case "/help":
      const termWidth = Math.max((outputBox.screen?.width || 80) - 8, 40);
      const helpMessage = termWidth < 60 ? `
{center}{bold}{blue-fg}INSCRIBE Help{/blue-fg}{/bold}{/center}

{bold}{blue-fg}Paper Processing{/blue-fg}{/bold}
  {cyan-fg}/paper{/cyan-fg} <path>      Load PDF
  {cyan-fg}/analyze{/cyan-fg}           Review structure  
  {cyan-fg}/generate{/cyan-fg} [path]   Create code

{bold}{green-fg}File Operations{/green-fg}{/bold}
  {cyan-fg}/edit{/cyan-fg} <file>       Load file
  {cyan-fg}/run{/cyan-fg} <cmd>         Execute command

{bold}{yellow-fg}Utilities{/yellow-fg}{/bold}
  {cyan-fg}/help{/cyan-fg}              Show help
  {cyan-fg}/about{/cyan-fg}             Version info
  {cyan-fg}/clear{/cyan-fg}             Clear output
  {cyan-fg}exit{/cyan-fg}               Exit app

{bold}Example:{/bold}
  /paper paper.pdf
  /generate
` : `
{center}{bold}{blue-fg}┌─── INSCRIBE - Paper to Code Implementation Tool ───┐{/blue-fg}{/bold}{/center}

{bold}{blue-fg}📄 Paper Processing{/blue-fg}{/bold}
  {cyan-fg}/paper{/cyan-fg} {white-fg}<path>{/white-fg}        Load and analyze a PDF research paper
  {cyan-fg}/analyze{/cyan-fg}              Review paper structure and algorithms  
  {cyan-fg}/generate{/cyan-fg} {white-fg}[path]{/white-fg}     Generate Python implementation (uses loaded paper or loads from path)

{bold}{green-fg}📁 File Operations{/green-fg}{/bold}
  {cyan-fg}/edit{/cyan-fg} {white-fg}<file>{/white-fg}         Load file content into context
  {cyan-fg}/run{/cyan-fg} {white-fg}<command>{/white-fg}       Execute shell commands

{bold}{yellow-fg}⚡ Utilities{/yellow-fg}{/bold}
  {cyan-fg}/help{/cyan-fg}                Show this comprehensive help
  {cyan-fg}/about{/cyan-fg}               Version and system information
  {cyan-fg}/clear{/cyan-fg}               Clear the output area
  {cyan-fg}/clean{/cyan-fg}               Clear screen completely
  {cyan-fg}exit{/cyan-fg} or {cyan-fg}/quit{/cyan-fg}         Exit INSCRIBE

{bold}{magenta-fg}📋 Example Workflows{/magenta-fg}{/bold}
  {bold}Workflow 1:{/bold}
  {dim}1.{/dim} {yellow-fg}/paper{/yellow-fg} {white-fg}./research/transformer.pdf{/white-fg}
  {dim}2.{/dim} {yellow-fg}/analyze{/yellow-fg} {dim}(optional - review content){/dim}
  {dim}3.{/dim} {yellow-fg}/generate{/yellow-fg} {dim}(creates implementation with venv){/dim}

  {bold}Workflow 2 (Direct):{/bold}
  {dim}1.{/dim} {yellow-fg}/generate{/yellow-fg} {white-fg}./research/transformer.pdf{/white-fg} {dim}(loads and generates in one step){/dim}

{bold}{gray-fg}💬 Chat Mode{/gray-fg}{/bold}
  Type messages directly to discuss papers and get AI assistance

{center}{dim}{blue-fg}└────────────────────────────────────────────────────┘{/blue-fg}{/dim}{/center}
`;
      outputBox.setContent(helpMessage);
      break;
    case "/about":
      outputBox.setContent(`INSCRIBE CLI version ${packageJson.version}`);
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
        const wrappedContent = wrapText(content);
        outputBox.setContent(
          chalk.bold.cyan(`Content of ${filePath}:\n\n`) + wrappedContent
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
          showError(chalk.red(`Command error:\n${wrapText(stderr)}`));
        } else {
          const wrappedOutput = wrapText(stdout);
          outputBox.setContent(
            chalk.bold.cyan(`Output of '${line}':\n\n`) + wrappedOutput
          );
        }
      } catch (error) {
        showError(chalk.red(`Command failed:\n${wrapText(error.message)}`));
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
      const wrappedLine = wrapText(line);
      outputBox.setContent(
        chalk.bold.cyan("You:") +
          `\n${wrappedLine}\n`
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
      originalPdfPath: pdfPath,
    };

    // Wrap long keywords for better display
    const keywordsDisplay = analysis.keywords.slice(0, 8).join(", ");
    const wrappedKeywords = keywordsDisplay.length > 60 ? 
      keywordsDisplay.substring(0, 57) + "..." : keywordsDisplay;

    const message = `📄 **Paper Loaded Successfully**

**Title:** ${analysis.title}
**Pages:** ${parseResult.content.pages}
**Classification:** ${analysis.classification.primaryType}
**Sections Found:** ${Object.keys(analysis.sections).length}
**Algorithm Blocks:** ${analysis.algorithmBlocks.length}

**Top Keywords:** ${wrappedKeywords}

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
      const truncatedContent = block.content.length > 200 ? 
        block.content.substring(0, 197) + "..." : block.content;
      message += `\n\n**Block ${i + 1}** (Confidence: ${(
        block.confidence * 100
      ).toFixed(1)}%)
Keywords: ${block.keywords.join(", ")}
${truncatedContent}`;
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
  // Check if we have a loaded paper or if a path is provided
  if (!context.paperAnalysis && args.length === 0) {
    outputBox.setContent(
      "{red-fg}No paper loaded. Use `/paper <path>` first or provide path: `/generate <pdf-path>`{/red-fg}"
    );
    return;
  }

  // If a path is provided, load the paper first
  if (args.length > 0) {
    const pdfPath = path.resolve(process.cwd(), args[0]);
    
    try {
      outputBox.setContent(
        `{cyan-fg}{bold}📄 Loading PDF for generation...{/bold}{/cyan-fg}`
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
        originalPdfPath: pdfPath,
      };
    } catch (error) {
      showError(`{red-fg}Failed to load PDF: ${error.message}{/red-fg}`);
      return;
    }
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
      createVenv: true,
      installRequirements: true,
    };

    const result = await codeGenerator.generateImplementation(
      context.paperAnalysis,
      options
    );

    if (result.success) {
      const isWindows = process.platform === "win32";
      const activationCmd = isWindows 
        ? `${result.outputPath}\\activate.bat`
        : `source ${result.outputPath}/activate.sh`;

      let message = `{green-fg}{bold}🎉 Implementation Generated Successfully!{/bold}{/green-fg}

{bold}Paper:{/bold} ${context.paperAnalysis.title}
{bold}Output Directory:{/bold} {cyan-fg}\`${result.outputPath}\`{/cyan-fg}
{bold}Virtual Environment:{/bold} ${result.venvCreated ? "{green-fg}✅ Created{/green-fg}" : "{red-fg}❌ Failed{/red-fg}"}
{bold}Requirements Installed:{/bold} ${result.requirementsInstalled ? "{green-fg}✅ Installed{/green-fg}" : "{red-fg}❌ Failed{/red-fg}"}

{bold}Files Created:{/bold}`;

      result.files.forEach((file) => {
        message += `\n{gray-fg}•{/gray-fg} ${file.name} {gray-fg}(${file.type}){/gray-fg}`;
      });

      if (result.validation) {
        message += `\n\n{bold}Code Validation:{/bold} ${
          result.validation.valid ? "{green-fg}✅ Passed{/green-fg}" : "{red-fg}❌ Failed{/red-fg}"
        }`;
        if (!result.validation.valid) {
          message += `\n{red-fg}Errors: ${result.validation.errors.join(", ")}{/red-fg}`;
        }
      }

      if (result.components.main) {
        const previewCode = result.components.main.substring(0, 400);
        message += `\n\n{bold}Preview:{/bold}\n{gray-fg}\`\`\`python\n${previewCode}...\n\`\`\`{/gray-fg}`;
      }

      message += `\n\n{bold}Next Steps:{/bold}
{yellow-fg}1.{/yellow-fg} Navigate to project: {cyan-fg}\`cd "${result.outputPath}"\`{/cyan-fg}
{yellow-fg}2.{/yellow-fg} Activate environment: {cyan-fg}\`${activationCmd}\`{/cyan-fg}
{yellow-fg}3.{/yellow-fg} Run examples: {cyan-fg}\`python examples_*.py\`{/cyan-fg}
{yellow-fg}4.{/yellow-fg} Run tests: {cyan-fg}\`pytest test_*.py\`{/cyan-fg}`;

      outputBox.setContent(message);
    } else {
      showError(`{red-fg}Code generation failed: ${result.error}{/red-fg}`);
    }
  } catch (error) {
    showError(`{red-fg}Generation error: ${error.message}{/red-fg}`);
  }
}
