# Project Switcher with Branch — Design

Date: 2026-08-21
Status: Approved (replaces calebporzio.simple-project-switcher, keeps cmd+; keybinding)

## Purpose

A minimal VS Code extension that opens a QuickPick listing all directories in the
projects folder (the parent of the current workspace folder, overridable via a
setting), and opens the selected one in a new window. Identical behavior to
Simple Project Switcher, plus one addition: each item shows the directory's
current git branch as grayed description text.

## Behavior

- Command `project-switcher-branch.switch`, bound to `cmd+;` (mac) / `ctrl+;`
  (win/linux) when not in QuickOpen; `cmd+;` / `cmd+shift+;` navigate
  next/previous while the picker is open.
- Projects folder: `project-switcher-branch.directory` setting, falling back to
  the parent of the first workspace folder.
- Directories only; sorted with most-recently-used projects first (recency list
  persisted in `globalState`, updated on window focus and on switch).
- Selecting an item runs `vscode.openFolder` in a new window.

## Branch display

- Read `<project>/.git/HEAD` directly (no git process spawned):
  - `ref: refs/heads/<branch>` → show `<branch>`
  - detached HEAD (raw hash) → show first 7 chars of the hash
  - `.git` is a file (worktree/submodule) → follow `gitdir:` to the real HEAD
  - not a git repo / unreadable → show nothing
- Branch rendered as the QuickPick item `description` (grayed text after the
  label), prefixed with the `$(git-branch)` codicon.

## Implementation shape

- Plain JavaScript, single `extension.js`, no dependencies, no build step.
- Packaged locally with `vsce package` into a `.vsix`.

## Error handling

- No workspace folder open → error message, same as the original.
- Any filesystem error while reading a project's HEAD is swallowed (item just
  shows no branch).

## Testing

- Manual: install the `.vsix`, open picker in a folder whose siblings include
  git repos on branches, a detached-HEAD repo, and a non-git directory.
