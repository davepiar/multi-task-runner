// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	context.subscriptions.push(vscode.commands.registerCommand('extension.runSequential', async () => {
		const tasks = await getTasks();
		for (const task of tasks) {
			await vscode.tasks.executeTask(task);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('extension.runParallel', async () => {
		const tasks = await getTasks();
		const promises = tasks.map(task => vscode.tasks.executeTask(task));
		await Promise.all(promises);
	}));
}

async function getTasks(): Promise<vscode.Task[]> {
	// 1. Fetch all the available tasks
	const allTasks = await vscode.tasks.fetchTasks();

	// 2. Show these tasks using showQuickPick
	const pickedTasks = await vscode.window.showQuickPick(allTasks.map(task => ({ label: task.name, task })), { canPickMany: true });

	// 3. Return the tasks that the user selected
	return pickedTasks?.map(item => item.task) || [];
}

// This method is called when your extension is deactivated
export function deactivate() { }
