# Project Switcher with Branch

A minimal project switcher for VS Code — a drop-in replacement for
[Simple Project Switcher](https://github.com/calebporzio/simple-project-switcher)
that also shows each project's current git branch.

Press `cmd+;` (mac) / `ctrl+;` to open the picker. It lists every directory in
your projects folder (the parent of the current workspace folder by default),
most-recently-used first, with the git branch shown in gray next to each name.
Selecting one opens it in a new window.

## Settings

- `project-switcher-branch.directory` — the projects directory to scan.
  Defaults to the parent of the current workspace folder.

## Install from source

```sh
npx @vscode/vsce package
code --install-extension project-switcher-branch-0.1.0.vsix
```

Then disable/uninstall the original Simple Project Switcher so the `cmd+;`
keybindings don't conflict.
