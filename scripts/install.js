import { execa } from 'execa';
import os from 'os';
import ora from 'ora';
import chalk from 'chalk';

const installOllama = async () => {
    const platform = os.platform();
    const spinner = ora('Installing Ollama...').start();

    try {
        if (platform === 'darwin' || platform === 'linux') {
            spinner.text = 'Downloading and running Ollama installation script...';
            await execa('curl -fsSL https://ollama.com/install.sh | sh', { shell: true });
            spinner.succeed('Ollama installed successfully.');
            return true;
        } else if (platform === 'win32') {
            spinner.warn(chalk.yellow('Ollama requires manual installation on Windows.'));
            console.log(chalk.cyan('Please download and install Ollama from: https://ollama.com/download'));
            console.log(chalk.cyan('After installation, please run `npm install` again.'));
            return false;
        } else {
            spinner.fail(`Unsupported platform: ${platform}`);
            return false;
        }
    } catch (error) {
        spinner.fail('Failed to install Ollama.');
        console.error(error);
        throw error; 
    }
};

const pullModel = async () => {
    const spinner = ora('Pulling Ollama model (comethrusws/sage-reasoning:3b)...').start();
    try {
        await execa('ollama', ['pull', 'comethrusws/sage-reasoning:3b']);
        spinner.succeed('Model pulled successfully.');
    } catch (error) {
        spinner.fail('Failed to pull model.');
        console.error(error);
        throw error;
    }
};

const installPdfProcessing = async () => {
    const platform = os.platform();
    const spinner = ora('Installing PDF processing tools (poppler)...').start();

    try {
        if (platform === 'darwin') {
            try {
                await execa('brew', ['--version']);
                spinner.text = 'Installing poppler via Homebrew...';
                await execa('brew', ['install', 'poppler']);
                spinner.succeed('PDF processing tools (poppler) installed successfully.');
                return true;
            } catch (brewError) {
                spinner.warn(chalk.yellow('Homebrew not found. Please install poppler manually.'));
                console.log(chalk.cyan('Install Homebrew: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'));
                console.log(chalk.cyan('Then run: brew install poppler'));
                return false;
            }
        } else if (platform === 'linux') {
            try {
                await execa('apt-get', ['--version']);
                spinner.text = 'Installing poppler-utils via apt-get...';
                await execa('sudo', ['apt-get', 'update']);
                await execa('sudo', ['apt-get', 'install', '-y', 'poppler-utils']);
                spinner.succeed('PDF processing tools (poppler-utils) installed successfully.');
                return true;
            } catch (aptError) {
                try {
                    await execa('yum', ['--version']);
                    spinner.text = 'Installing poppler-utils via yum...';
                    await execa('sudo', ['yum', 'install', '-y', 'poppler-utils']);
                    spinner.succeed('PDF processing tools (poppler-utils) installed successfully.');
                    return true;
                } catch (yumError) {
                    try {
                        await execa('dnf', ['--version']);
                        spinner.text = 'Installing poppler-utils via dnf...';
                        await execa('sudo', ['dnf', 'install', '-y', 'poppler-utils']);
                        spinner.succeed('PDF processing tools (poppler-utils) installed successfully.');
                        return true;
                    } catch (dnfError) {
                        spinner.warn(chalk.yellow('Package manager not found. Please install poppler-utils manually.'));
                        console.log(chalk.cyan('Ubuntu/Debian: sudo apt-get install poppler-utils'));
                        console.log(chalk.cyan('CentOS/RHEL: sudo yum install poppler-utils'));
                        console.log(chalk.cyan('Fedora: sudo dnf install poppler-utils'));
                        return false;
                    }
                }
            }
        } else if (platform === 'win32') {
            spinner.warn(chalk.yellow('PDF processing tools require manual installation on Windows.'));
            console.log(chalk.cyan('Please install poppler for Windows:'));
            console.log(chalk.cyan('1. Download from: https://blog.alivate.com.au/poppler-windows/'));
            console.log(chalk.cyan('2. Extract and add to your PATH'));
            console.log(chalk.cyan('3. Or use Chocolatey: choco install poppler'));
            return false;
        } else {
            spinner.fail(`Unsupported platform: ${platform}`);
            return false;
        }
    } catch (error) {
        spinner.fail('Failed to install PDF processing tools.');
        console.error(error);
        console.log(chalk.yellow('Please install poppler manually for PDF processing capabilities.'));
        return false;
    }
};

const main = async () => {
    console.log(chalk.bold.cyan('🚀 Setting up INSCRIBE - Paper to Code Implementation Tool\n'));
    
    let ollamaInstalled = false;
    let pdfProcessingInstalled = false;

    try {
        await execa('ollama', ['--version']);
        ollamaInstalled = true;
        console.log(chalk.green('✓ Ollama is already installed.'));
    } catch (error) {
        console.log(chalk.yellow('Ollama not found. Installing...'));
        ollamaInstalled = await installOllama();
    }

    try {
        await execa('pdftotext', ['-v']);
        pdfProcessingInstalled = true;
        console.log(chalk.green('✓ PDF processing tools (pdftotext) are already installed.'));
    } catch (error) {
        console.log(chalk.yellow('PDF processing tools not found. Installing...'));
        pdfProcessingInstalled = await installPdfProcessing();
    }

    if (ollamaInstalled) {
        await pullModel();
    }

    console.log(chalk.bold.cyan('\n📋 Installation Summary:'));
    console.log(`${ollamaInstalled ? chalk.green('✓') : chalk.red('✗')} Ollama: ${ollamaInstalled ? 'Ready' : 'Manual installation required'}`);
    console.log(`${pdfProcessingInstalled ? chalk.green('✓') : chalk.red('✗')} PDF Processing: ${pdfProcessingInstalled ? 'Ready' : 'Manual installation required'}`);
    
    if (ollamaInstalled && pdfProcessingInstalled) {
        console.log(chalk.bold.green('\n🎉 INSCRIBE is ready to use! Run `inscribe` to get started.'));
    } else {
        console.log(chalk.bold.yellow('\n⚠️  Some dependencies require manual installation. Please follow the instructions above.'));
    }
};

main().catch(() => process.exit(1));
