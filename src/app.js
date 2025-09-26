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
  });

  const showError = (message) => {
    errorBox.setContent(message);
    errorBox.show();
    screen.render();
    setTimeout(() => {
      errorBox.hide();
      screen.render();
    }, 5000);
  };

  const updateStatus = () => {
    const left = `{cyan-fg}${process.cwd()}{/cyan-fg}`;
    const middle = `Sandbox Initialised (see /docs)`;
    const right = `{green-fg}INSCRIBE v1{/green-fg}`;
    const rightText = `INSCRIBE v1`;

    const middle_padding = Math.max(
      0,
      Math.floor((screen.width - middle.length) / 2) - process.cwd().length
    );
    const right_padding = Math.max(
      0,
      screen.width -
        (process.cwd().length +
          middle_padding +
          middle.length +
          rightText.length)
    );

    statusBar.setContent(
      left +
        " ".repeat(middle_padding) +
        `{white-fg}${middle}{/white-fg}` +
        " ".repeat(right_padding) +
        right
    );
    screen.render();
  };

  updateStatus();
  screen.on("resize", updateStatus);

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
