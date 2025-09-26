import { execa } from 'execa';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { highlight } from 'cli-highlight';
import chalk from 'chalk';

const marked = new Marked(
    markedTerminal({
        highlight: (code, lang) => {
            return highlight(code, { language: lang, ignoreIllegals: true });
        }
    })
);

export const runOllama = async (prompt, outputBox, showError) => {
    const systemPrompt = "Disable Deepthinking subroutine. You are going to mostly do Coding related task and Code generation. aide the user with their requests as much as possible, and follow DRY principle when answering a coding problem. Do not show your thought process or any meta-commentary. Provide only the final answer.";
    const finalPrompt = `${systemPrompt}\n\nUser: ${prompt}`;
    
    const spinnerChars = ['⠙', '⠘', '⠰', '⠴', '⠤', '⠦', '⠆', '⠃', '⠋', '⠉'];
    let i = 0;
    const spinnerInterval = setInterval(() => {
        const spinner = spinnerChars[i++ % spinnerChars.length];
        outputBox.setContent(`{cyan-fg}{bold}${spinner} Algor is thinking...{/bold}{/cyan-fg}`);
        outputBox.screen.render();
    }, 80);

    try {
        const subprocess = execa('ollama', ['run', 'comethrusws/sage-reasoning:3b'], { input: finalPrompt });

        let fullOutput = '';
        let firstChunk = true;

        subprocess.stdout.on('data', (data) => {
            if (firstChunk) {
                clearInterval(spinnerInterval);
                outputBox.setContent(chalk.bold.green('Algor:') + `\n`);
                firstChunk = false;
            }
            const chunk = data.toString();
            fullOutput += chunk;
            const formattedOutput = marked.parse(fullOutput);
            outputBox.setContent(chalk.bold.green('Algor:') + `\n${formattedOutput}`);
            outputBox.screen.render();
        });

        await subprocess;

    } catch (error) {
        clearInterval(spinnerInterval);
        const errorMessage = error.stderr || error.message;
        showError(`${chalk.red('Error communicating with Ollama:')}\n${errorMessage}\nPlease ensure Ollama is running and the model \`comethrusws/sage-reasoning:3b\` is installed.`);
    }
};
