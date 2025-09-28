import chalk from "chalk";

export const printLogo = () => {
  const logoLines = [
    `██╗███╗   ██╗███████╗ ██████╗██████╗ ██╗██████╗ ███████╗`,
    `██║████╗  ██║██╔════╝██╔════╝██╔══██╗██║██╔══██╗██╔════╝`,
    `██║██╔██╗ ██║███████╗██║     ██████╔╝██║██████╔╝█████╗  `,
    `██║██║╚██╗██║╚════██║██║     ██╔══██╗██║██╔══██╗██╔══╝  `,
    `██║██║ ╚████║███████║╚██████╗██║  ██║██║██████╔╝███████╗`,
    `╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝`,
  ];

  const termWidth = Math.max(process.stdout.columns || 80, 80);
  const logoWidth = Math.max(...logoLines.map((line) => line.length));
  
  // Only center if terminal is wide enough, otherwise left-align
  const padding = termWidth > logoWidth ? Math.floor((termWidth - logoWidth) / 2) : 0;

  const startColor = { r: 30, g: 144, b: 255 }; 
  const endColor = { r: 0, g: 255, b: 255 }; 

  let logoString = "\n";

  logoLines.forEach((line, index) => {
    const ratio = index / (logoLines.length - 1);
    const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

    // Truncate logo if terminal is too narrow
    const displayLine = termWidth < logoWidth ? line.substring(0, termWidth - 4) + "..." : line;
    const paddedLine = " ".repeat(Math.max(0, padding)) + displayLine;
    logoString += chalk.rgb(r, g, b)(paddedLine) + "\n";
  });

  const subtitle = "📝 Paper-to-Code Implementation Tool";
  const maxSubtitleWidth = Math.min(subtitle.length, termWidth - 4);
  const truncatedSubtitle = subtitle.length > maxSubtitleWidth ? 
    subtitle.substring(0, maxSubtitleWidth - 3) + "..." : subtitle;
  const subtitlePadding = termWidth > truncatedSubtitle.length ? 
    Math.floor((termWidth - truncatedSubtitle.length) / 2) : 0;
  
  logoString += "\n";
  logoString +=
    " ".repeat(Math.max(0, subtitlePadding)) +
    chalk.gray.italic(truncatedSubtitle) +
    "\n";
  logoString += "\n";

  return logoString;
};

export const createStatusLine = (version = "v1.0.0") => {
  const termWidth = Math.max(process.stdout.columns || 80, 40);
  const leftText = "🚀 Ready";
  const rightText = `INSCRIBE ${version}`;
  
  // Calculate available space and truncate if necessary
  const totalTextLength = leftText.length + rightText.length;
  const availableSpace = termWidth - totalTextLength - 2; // 2 for padding
  
  if (availableSpace < 0) {
    // Terminal too narrow, show minimal version
    const minimalLeft = "Ready";
    const minimalRight = "INSCRIBE";
    const minimalSpace = Math.max(0, termWidth - minimalLeft.length - minimalRight.length);
    return chalk.green(minimalLeft) + " ".repeat(minimalSpace) + chalk.cyan.dim(minimalRight);
  }
  
  const spaces = Math.max(1, availableSpace);
  return chalk.green(leftText) + " ".repeat(spaces) + chalk.cyan.dim(rightText);
};

export const createWelcomeMessage = () => {
  const termWidth = Math.max(process.stdout.columns || 80, 40);
  
  // Responsive welcome message based on terminal width
  if (termWidth < 60) {
    return `{center}{bold}{cyan-fg}INSCRIBE{/cyan-fg}{/bold}{/center}

{cyan-fg}●{/cyan-fg} Transform papers to Python code
{cyan-fg}●{/cyan-fg} AI-powered analysis  
{cyan-fg}●{/cyan-fg} Clean, documented output

{bold}Quick Start:{/bold}
{yellow-fg}1.{/yellow-fg} {gray-fg}/paper{/gray-fg} <pdf>
{yellow-fg}2.{/yellow-fg} {gray-fg}/analyze{/gray-fg}
{yellow-fg}3.{/yellow-fg} {gray-fg}/generate{/gray-fg}

Type {cyan-fg}/help{/cyan-fg} for commands`;
  }
  
  return `{center}{bold}{cyan-fg}Welcome to INSCRIBE{/cyan-fg}{/bold}{/center}

{cyan-fg}●{/cyan-fg} Transform research papers into Python implementations
{cyan-fg}●{/cyan-fg} AI-powered algorithm extraction and analysis  
{cyan-fg}●{/cyan-fg} Clean, documented, and structured code generation

{bold}Quick Start:{/bold}
{yellow-fg}1.{/yellow-fg} {gray-fg}/paper{/gray-fg} <pdf-file>  → Load and analyze a research paper
{yellow-fg}2.{/yellow-fg} {gray-fg}/analyze{/gray-fg}           → Review paper structure and algorithms
{yellow-fg}3.{/yellow-fg} {gray-fg}/generate{/gray-fg}          → Generate Python implementation

Type {cyan-fg}/help{/cyan-fg} for complete command reference`;
};
