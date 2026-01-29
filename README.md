```
 ███╗   ██╗██╗   ██╗███████╗
 ████╗  ██║██║   ██║██╔════╝
 ██╔██╗ ██║██║   ██║███████╗
 ██║╚██╗██║╚██╗ ██╔╝╚════██║
 ██║ ╚████║ ╚████╔╝ ███████║
 ╚═╝  ╚═══╝  ╚═══╝  ╚══════╝
```

Dotfiles manager with a modern TUI.

## Install

```bash
bun install -g nvs-cli
```

## Usage

```bash
nvs                     # Initialize dotfiles
nvs init ~/dotfiles     # Use specific path
nvs add user/repo       # Add from GitHub
```

## Features

- Auto-detects existing dotfiles
- Clones from GitHub
- Handles conflicts with backup
- Tracks linked files in `~/.nvs/config.json`

## License

MIT
