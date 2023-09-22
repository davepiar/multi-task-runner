// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	context.subscriptions.push(vscode.commands.registerCommand('extension.runSequential', async () => {
		const tasks = await getTasks();
		// Assuming you provide a way to select tasks, for example "selectedTasks"
		runTasksSequentially(tasks).catch(error => {
			vscode.window.showErrorMessage(`Error running tasks: ${error.message}`);
		});
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

function runTasksSequentially(tasks: vscode.Task[]): Promise<void> {
	return tasks.reduce((promiseChain, currentTask) => {
		return promiseChain.then(() => runTask(currentTask));
	}, Promise.resolve());
}

function runTask(task: vscode.Task): Promise<void> {
	return new Promise((resolve, reject) => {
		let disposable = vscode.tasks.onDidEndTask((event) => {
			if (event.execution.task === task) {
				disposable.dispose();
				resolve();
			}
		});

		vscode.tasks.executeTask(task).then((execution) => {
			if (!execution) {
				disposable.dispose();
				reject(new Error("Failed to start the task"));
			}
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
