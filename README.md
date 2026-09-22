# Project Switcher

A minimal project switcher for VS Code that shows each project's current git
branch. Inspired by [Simple Project Switcher](https://github.com/calebporzio/simple-project-switcher).

Press `cmd+;` (mac) / `ctrl+;` to open the picker. It lists every directory in
your projects folder (the parent of the current workspace folder by default),
most-recently-used first, with the git branch shown in gray next to each name.
Selecting one opens it in a new window.

## Settings

- `project-switcher.directory` — the projects directory to scan.
  Defaults to the parent of the current workspace folder.

## Install from source

```sh
npx @vscode/vsce package
code --install-extension project-switcher-0.1.2.vsix
```
