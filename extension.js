'use strict';

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
	if (!vscode.workspace.workspaceFolders) return;

	const projectsFolder = normalizePath(
		config('project-switcher.directory',
			normalizePath(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '..')))
	);

	const currentProject = normalizePath(
		path.relative(projectsFolder, normalizePath(vscode.workspace.workspaceFolders[0].uri.fsPath))
	);

	if (vscode.window.state.focused) updateMostRecentProject(context, currentProject);

	context.subscriptions.push(vscode.window.onDidChangeWindowState((event) => {
		if (event.focused) updateMostRecentProject(context, currentProject);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('project-switcher.switch', () => {
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage('Project Switcher requires at least one folder to be open.');
			return;
		}

		const projects = getProjectsFromDirectory(projectsFolder);
		const recent = context.globalState.get('project-switcher.recent', [])
			.filter((name) => name in projects);
		const byActivity = Object.keys(projects)
			.sort((a, b) => getLastWorkedAt(projects[b]) - getLastWorkedAt(projects[a]));
		const sorted = Array.from(new Set(recent.concat(byActivity)));

		const quickPick = vscode.window.createQuickPick();
		quickPick.matchOnDescription = true;
		quickPick.items = sorted.map((project) => {
			const branch = getBranch(projects[project]);
			return {
				label: project,
				description: branch ? `$(git-branch) ${branch}` : '',
			};
		});

		quickPick.onDidChangeSelection((selections) => {
			const project = selections[0] && selections[0].label;
			if (!project) return;

			updateMostRecentProject(context, project);
			vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projects[project]), true);
		});

		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));
}

function getProjectsFromDirectory(projectsFolder) {
	const projects = {};

	fs.readdirSync(projectsFolder)
		.map((name) => path.join(projectsFolder, name))
		.filter((fullPath) => {
			try {
				return fs.lstatSync(fullPath).isDirectory();
			} catch {
				return false;
			}
		})
		.forEach((fullPath) => {
			projects[path.relative(projectsFolder, fullPath)] = fullPath;
		});

	return projects;
}

function getLastWorkedAt(projectPath) {
	// Newest of .git/index and .git/HEAD — touched on every commit, checkout,
	// or stage, so it tracks real work even from a terminal or another editor.
	try {
		let gitPath = path.join(projectPath, '.git');
		if (fs.lstatSync(gitPath).isFile()) {
			const match = fs.readFileSync(gitPath, 'utf8').match(/^gitdir:\s*(.+)\s*$/m);
			if (match) gitPath = path.resolve(projectPath, match[1]);
		}

		return Math.max(...['index', 'HEAD'].map((file) => {
			try {
				return fs.statSync(path.join(gitPath, file)).mtimeMs;
			} catch {
				return 0;
			}
		}));
	} catch {
		try {
			return fs.statSync(projectPath).mtimeMs;
		} catch {
			return 0;
		}
	}
}

function getBranch(projectPath) {
	try {
		let gitPath = path.join(projectPath, '.git');
		const stat = fs.lstatSync(gitPath);

		// Worktrees and submodules use a ".git" file pointing at the real git dir.
		if (stat.isFile()) {
			const match = fs.readFileSync(gitPath, 'utf8').match(/^gitdir:\s*(.+)\s*$/m);
			if (!match) return null;
			gitPath = path.resolve(projectPath, match[1]);
		}

		const head = fs.readFileSync(path.join(gitPath, 'HEAD'), 'utf8').trim();

		const ref = head.match(/^ref:\s*refs\/heads\/(.+)$/);
		if (ref) return ref[1];

		return /^[0-9a-f]{40}$/i.test(head) ? head.slice(0, 7) : null;
	} catch {
		return null;
	}
}

function updateMostRecentProject(context, currentProject) {
	currentProject = normalizePath(currentProject);
	const recent = context.globalState.get('project-switcher.recent', []);
	recent.unshift(currentProject);
	context.globalState.update('project-switcher.recent', Array.from(new Set(recent)));
}

function config(setting, fallback) {
	return vscode.workspace.getConfiguration().get(setting) || fallback;
}

function normalizePath(p) {
	return p.replace('/c:/', 'c:/').replace('/C:/', 'C:/').replace(/\\/g, '/');
}

function deactivate() {}

module.exports = { activate, deactivate };
