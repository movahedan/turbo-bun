import { rm } from "node:fs/promises";
import chalk from "chalk";
import { runnables } from "./config";

async function cleanup() {
	const baseDir = process.cwd();
	const sources = [baseDir, ...runnables.map((runnable) => runnable.absPath)];

	const directories = [
		".turbo",
		".cache",
		".vercel",
		".next",
		"build",
		"dist",
		"out",
		"node_modules",
	];

	for (const source of sources) {
		console.log(chalk.green(`👋 Removing cache related files from ${source}`));
		for (const directory of directories) {
			try {
				await rm(`${[source, directory].join("/")}`, {
					recursive: true,
					force: true,
				});
			} catch {}
		}
	}
	console.log(chalk.green("👋 Cache related files removed successfully"));
	console.log(chalk.green("👋 Dist related files removed successfully"));
}

cleanup();
