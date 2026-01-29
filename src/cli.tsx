#!/usr/bin/env bun
import { render } from 'ink';
import meow from 'meow';
import { InitCommand } from './commands/init.js';
import { AddCommand } from './commands/add.js';

const cli = meow(`
  Usage
    $ nvs                   Initialize dotfiles setup
    $ nvs init [path]       Initialize with optional path
    $ nvs add <repo>        Add dotfiles from GitHub repo

  Options
    --help                  Show help
    --version               Show version

  Examples
    $ nvs
    $ nvs init ~/dotfiles
    $ nvs add nvsio/dotfiles
    $ nvs add https://github.com/user/repo
`, {
  importMeta: import.meta,
  flags: {},
});

const [command, ...args] = cli.input;

if (!command || command === 'init') {
  render(<InitCommand path={args[0]} />);
} else if (command === 'add') {
  if (!args[0]) {
    console.error('Error: Please specify a repository (e.g., nvs add user/repo)');
    process.exit(1);
  }
  render(<AddCommand repo={args[0]} />);
} else {
  cli.showHelp();
}
