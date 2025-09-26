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

  const termWidth = process.stdout.columns || 120;
  const logoWidth = Math.max(...logoLines.map((line) => line.length));
  const padding = Math.floor((termWidth - logoWidth) / 2);

  const startColor = { r: 30, g: 144, b: 255 }; 
  const endColor = { r: 0, g: 255, b: 255 }; 

  let logoString = "\n";

  logoLines.forEach((line, index) => {
    const ratio = index / (logoLines.length - 1);
    const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

    const paddedLine = " ".repeat(Math.max(0, padding)) + line;
    logoString += chalk.rgb(r, g, b)(paddedLine) + "\n";
  });

  const subtitle = "📝 Paper-to-Code Implementation Tool";
  const subtitlePadding = Math.floor((termWidth - subtitle.length) / 2);
  logoString += "\n";
  logoString +=
    " ".repeat(Math.max(0, subtitlePadding)) +
    chalk.gray.italic(subtitle) +
    "\n";
  logoString += "\n";

  return logoString;
};

export const createStatusLine = (version = "v1.0.0") => {
  const termWidth = process.stdout.columns || 120;
  const leftText = "🚀 Ready for paper analysis";
  const rightText = `INSCRIBE ${version}`;
  const spaces = Math.max(0, termWidth - leftText.length - rightText.length);

  return chalk.green(leftText) + " ".repeat(spaces) + chalk.cyan.dim(rightText);
};

export const createWelcomeMessage = () => {
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
