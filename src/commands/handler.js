import chalk from 'chalk';
import { runOllama } from '../ollama/client.js';
import { createRequire } from 'module';
import fs from 'fs/promises';
import { execa } from 'execa';
import path from 'path';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');

export const handleCommand = async (line, outputBox, showError, quickStartContent) => {
    const parts = line.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
        case '/help':
            const helpMessage = `
╭────────────────────────────────────────────────────────────────╮
│                                                                │
│ Basics:                                                        │
│   - Ask questions to Ollama.                                   │
│   - Use commands for specific actions.                         │
│                                                                │
│ Commands:                                                      │
│   /help                - Display this help message.            │
│   /about               - Display version info.                 │
│   /clear               - Clear the chat context.               │
│   /clean               - Clear the screen                      │
│   /edit <file>         - Load a file into the context.         │
│   /run <command>       - Run a command.                        │
│   /test <file>         - Run tests for a file. (Coming Soon)   │
│   /history             - Display command history. (Coming Soon)│
│   exit, /quit         - Exit the application.                  │
│                                                                │
│ Keyboard Shortcuts:                                            │
│   Ctrl+C, q, escape    - Quit application                      │
│   Ctrl+L               - Clear the screen                      │
│   Up/Down Arrows       - Navigate command history              │
│   Enter                - Send message                          │
│                                                                │
╰────────────────────────────────────────────────────────────────╯
`;
            outputBox.setContent(helpMessage);
            break;
        case '/about':
            outputBox.setContent(`SAGE Algor CLI version ${packageJson.version}`);
            break;
        case '/clear':
            outputBox.setContent(quickStartContent);
            break;
        case '/clean':
            outputBox.setContent('');
            break;
        case '/edit':
            if (args.length === 0) {
                outputBox.setContent(chalk.red('Please provide a file path.'));
                break;
            }
            const filePath = path.resolve(process.cwd(), args[0]);
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                outputBox.setContent(chalk.bold.cyan(`Content of ${filePath}:\n\n`) + content);
            } catch (error) {
                showError(chalk.red(`Error reading file: ${error.message}`));
            }
            break;
        case '/run':
            if (args.length === 0) {
                outputBox.setContent(chalk.red('Please provide a command to run.'));
                break;
            }
            const cmd = args[0];
            const cmdArgs = args.slice(1);
            try {
                const { stdout, stderr } = await execa(cmd, cmdArgs);
                if (stderr) {
                    showError(chalk.red(`Command error:\n${stderr}`));
                } else {
                    outputBox.setContent(chalk.bold.cyan(`Output of '${line}':\n\n`) + stdout);
                }
            } catch (error) {
                showError(chalk.red(`Command failed:\n${error.message}`));
            }
            break;
        case '/test':
            outputBox.setContent(chalk.blue(`Testing ${args.join(' ')}... (Not implemented)`));
            break;
        case '/history':
            outputBox.setContent(chalk.blue('Displaying history... (Not implemented)'));
            break;
        case 'exit':
        case '/quit':
            return process.exit(0);
        default:
            outputBox.setContent(chalk.bold.cyan('You:') + `
${line}
`);
            return runOllama(line, outputBox, showError);
    }
    outputBox.screen.render();
};
