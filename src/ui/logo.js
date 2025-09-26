import chalk from 'chalk';

export const printLogo = () => {
    const logoLines = [
        `███████╗ █████╗  ██████╗ ███████╗     █████╗ ██╗      ██████╗  ██████╗ ██████╗ `,
        `██╔════╝██╔══██╗██╔════╝ ██╔════╝    ██╔══██╗██║     ██╔════╝ ██╔═══██╗██╔══██╗`,
        `███████╗███████║██║  ███╗█████╗█████╗███████║██║     ██║  ███╗██║   ██║██████╔╝`,
        `╚════██║██╔══██║██║   ██║██╔══╝╚════╝██╔══██║██║     ██║   ██║██║   ██║██╔══██╗`,
        `███████║██║  ██║╚██████╔╝███████╗    ██║  ██║███████╗╚██████╔╝╚██████╔╝██║  ██║`,
        `╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝`
    ];

    const termWidth = process.stdout.columns || 120;

    const startColor = { r: 0, g: 255, b: 255 }; // Cyan
    const endColor = { r: 0, g: 255, b: 0 };   // Green

    let logoString = '\n';
    logoLines.forEach((line, index) => {
        const ratio = index / (logoLines.length - 1);
        const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
        const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
        const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

        let truncatedLine = line.length > termWidth ? line.substring(0, termWidth) : line;
        logoString += chalk.rgb(r, g, b)(truncatedLine) + '\n';
    });
    logoString += '\n';
    return logoString;
};
