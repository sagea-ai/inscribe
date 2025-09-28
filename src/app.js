import blessed from "blessed";
import {
  printLogo,
  createWelcomeMessage,
  createStatusLine,
} from "./ui/logo.js";
import { handleCommand } from "./commands/handler.js";
import chalk from "chalk";

export const App = () => {
  const screen = blessed.screen({
    smartCSR: true,
    title: "INSCRIBE - Paper to Code Implementation Tool",
    fullUnicode: true,
    dockBorders: true,
    autoPadding: true,
  });

  const headerBox = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: 12,
    content: printLogo(),
    tags: true,
    border: {
      type: "line",
      fg: "blue",
    },
    style: {
      border: {
        fg: "cyan",
      },
    },
    wrap: false,
    scrollable: false,
  });

  const contentBox = blessed.box({
    parent: screen,
    tags: true,
    top: 12,
    left: 0,
    width: "100%",
    height: "100%-16",
    content: createWelcomeMessage(),
    scrollable: true,
    alwaysScroll: true,
    border: {
      type: "line",
      fg: "gray",
    },
    style: {
      border: {
        fg: "gray",
      },
      scrollbar: {
        bg: "blue",
        fg: "white",
      },
    },
    scrollbar: {
      ch: "█",
      track: {
        bg: "blue",
      },
      style: {
        inverse: true,
      },
    },
    mouse: true,
    keys: true,
    vi: true,
    padding: {
      left: 2,
      right: 2,
      top: 1,
      bottom: 1,
    },
    wrap: true,
    wordWrap: true,
  });

  const inputBox = blessed.textbox({
    parent: screen,
    bottom: 1,
    left: 0,
    width: "100%",
    height: 3,
    border: {
      type: "line",
      fg: "cyan",
    },
    style: {
      border: {
        fg: "cyan",
      },
      focus: {
        border: {
          fg: "yellow",
        },
        bg: "black",
      },
      bg: "black",
      fg: "white",
    },
    inputOnFocus: true,
    label: {
      text: "  💬 Enter command or message  ",
      side: "left",
    },
    padding: {
      left: 1,
      right: 1,
    },
  });

  const statusBar = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    width: "100%",
    height: 1,
    tags: true,
    style: {
      bg: "blue",
      fg: "white",
    },
    content: createStatusLine(),
  });

  const errorBox = blessed.box({
    parent: screen,
    bottom: 5,
    left: "center",
    width: "80%",
    height: 5,
    border: {
      type: "line",
      fg: "red",
    },
    style: {
      border: {
        fg: "red",
        type: "heavy",
      },
      bg: "black",
      fg: "red",
    },
    tags: true,
    hidden: true,
    shadow: true,
    padding: {
      left: 1,
      right: 1,
      top: 0,
      bottom: 0,
    },
    label: {
      text: " ⚠️  Error ",
      side: "left",
    },
    wrap: true,
    wordWrap: true,
  });

  const showError = (message) => {
    // Truncate error message if too long
    const maxErrorLength = Math.max((screen.width || 80) * 3, 200);
    const truncatedMessage = message.length > maxErrorLength ?
      message.substring(0, maxErrorLength - 3) + "..." : message;

    errorBox.setContent(truncatedMessage);
    errorBox.show();
    screen.render();
    setTimeout(() => {
      errorBox.hide();
      screen.render();
    }, 5000);
  };

  const updateStatus = () => {
    const termWidth = screen.width || 80;
    const cwd = process.cwd();
    const maxCwdLength = Math.floor(termWidth * 0.3); // 30% of terminal width
    const truncatedCwd = cwd.length > maxCwdLength ?
      "..." + cwd.substring(cwd.length - maxCwdLength + 3) : cwd;

    const left = `{cyan-fg}${truncatedCwd}{/cyan-fg}`;
    const middle = "Sandbox Initialised";
    const right = "{green-fg}INSCRIBE v1{/green-fg}";
    const rightText = "INSCRIBE v1";

    // Calculate lengths without tags
    const leftLength = truncatedCwd.length;
    const middleLength = middle.length;
    const rightLength = rightText.length;

    const totalTextLength = leftLength + middleLength + rightLength;

    if (totalTextLength >= termWidth) {
      // Minimal version for narrow terminals
      const minimalMiddle = "Ready";
      const minimalRight = "INSCRIBE";
      const availableSpace = Math.max(0, termWidth - leftLength - minimalMiddle.length - minimalRight.length);

      if (availableSpace < 2) {
        statusBar.setContent("{green-fg}INSCRIBE{/green-fg}");
      } else {
        const spacing = Math.floor(availableSpace / 2);
        statusBar.setContent(
          left +
          " ".repeat(spacing) +
          `{white-fg}${minimalMiddle}{/white-fg}` +
          " ".repeat(availableSpace - spacing) +
          `{green-fg}${minimalRight}{/green-fg}`
        );
      }
    } else {
      const totalSpacing = termWidth - totalTextLength;
      const leftSpacing = Math.floor(totalSpacing * 0.3);
      const rightSpacing = totalSpacing - leftSpacing;

      statusBar.setContent(
        left +
        " ".repeat(leftSpacing) +
        `{white-fg}${middle}{/white-fg}` +
        " ".repeat(rightSpacing) +
        right
      );
    }

    screen.render();
  };

  // Update status on screen resize
  updateStatus();
  screen.on("resize", () => {
    headerBox.setContent(printLogo());
    contentBox.setContent(createWelcomeMessage());
    updateStatus();
  });

  const history = [];
  let historyIndex = 0;

  let readyToExit = false;
  let exitTimeout = null;

  const cancelExit = () => {
    if (readyToExit) {
      readyToExit = false;
      clearTimeout(exitTimeout);
      updateStatus();
    }
  };

  screen.key(["escape", "q"], (ch, key) => {
    return process.exit(0);
  });
  inputBox.key(["escape", "q"], (ch, key) => {
    return process.exit(0);
  });

  const handleCtrlC = () => {
    if (readyToExit) {
      return;
    }
    readyToExit = true;
    statusBar.setContent(
      "{red-fg}Press (c) to exit. Any other key to cancel.{/red-fg}"
    );
    screen.render();
    exitTimeout = setTimeout(() => {
      cancelExit();
    }, 2000);
  };

  screen.key("C-c", handleCtrlC);
  inputBox.key("C-c", handleCtrlC);

  screen.on("keypress", (ch, key) => {
    if (readyToExit) {
      if (key.name === "c" && !key.ctrl) {
        return process.exit(0);
      }
      if (key.name === "c" && key.ctrl) {
        return;
      }
      cancelExit();
    }
  });

  inputBox.key(["C-l"], (ch, key) => {
    contentBox.setContent(createWelcomeMessage());
    screen.render();
  });

  inputBox.on("submit", (line) => {
    if (line.trim()) {
      history.push(line);
      historyIndex = history.length;
      handleCommand(line, contentBox, showError, createWelcomeMessage());
    }
    inputBox.clearValue();
    inputBox.focus();
    screen.render();
  });

  inputBox.key("up", () => {
    if (historyIndex > 0) {
      historyIndex--;
      inputBox.setValue(history[historyIndex]);
      screen.render();
    }
  });

  inputBox.key("down", () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      inputBox.setValue(history[historyIndex]);
      screen.render();
    } else {
      historyIndex = history.length;
      inputBox.clearValue();
      screen.render();
    }
  });

  inputBox.focus();
  screen.render();
};
