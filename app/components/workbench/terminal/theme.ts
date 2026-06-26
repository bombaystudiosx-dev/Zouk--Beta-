import type { ITheme } from '@xterm/xterm';

const style = getComputedStyle(document.documentElement);
const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

export function getTerminalTheme(overrides?: ITheme): ITheme {
  return {
    cursor: cssVar('--zouk-elements-terminal-cursorColor'),
    cursorAccent: cssVar('--zouk-elements-terminal-cursorColorAccent'),
    foreground: cssVar('--zouk-elements-terminal-textColor'),
    background: cssVar('--zouk-elements-terminal-backgroundColor'),
    selectionBackground: cssVar('--zouk-elements-terminal-selection-backgroundColor'),
    selectionForeground: cssVar('--zouk-elements-terminal-selection-textColor'),
    selectionInactiveBackground: cssVar('--zouk-elements-terminal-selection-backgroundColorInactive'),

    // ansi escape code colors
    black: cssVar('--zouk-elements-terminal-color-black'),
    red: cssVar('--zouk-elements-terminal-color-red'),
    green: cssVar('--zouk-elements-terminal-color-green'),
    yellow: cssVar('--zouk-elements-terminal-color-yellow'),
    blue: cssVar('--zouk-elements-terminal-color-blue'),
    magenta: cssVar('--zouk-elements-terminal-color-magenta'),
    cyan: cssVar('--zouk-elements-terminal-color-cyan'),
    white: cssVar('--zouk-elements-terminal-color-white'),
    brightBlack: cssVar('--zouk-elements-terminal-color-brightBlack'),
    brightRed: cssVar('--zouk-elements-terminal-color-brightRed'),
    brightGreen: cssVar('--zouk-elements-terminal-color-brightGreen'),
    brightYellow: cssVar('--zouk-elements-terminal-color-brightYellow'),
    brightBlue: cssVar('--zouk-elements-terminal-color-brightBlue'),
    brightMagenta: cssVar('--zouk-elements-terminal-color-brightMagenta'),
    brightCyan: cssVar('--zouk-elements-terminal-color-brightCyan'),
    brightWhite: cssVar('--zouk-elements-terminal-color-brightWhite'),

    ...overrides,
  };
}
