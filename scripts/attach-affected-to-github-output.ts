#!/usr/bin/env bun

import { getAffectedRunnables } from "./utils/affected";

async function attachAffectedToGithubOutput() {
	try {
		const affectedRunnables = await getAffectedRunnables().then((runnables) =>
			runnables
				.map((runnable) => {
					// Handle UI package specially - convert @repo/ui to ui
					const key = runnable.key === "@repo/ui" ? "ui" : runnable.key;
					return `prod-${key}`;
				})
				.join(" "),
		);

		// Output in GitHub Actions format
		if (process.env.GITHUB_OUTPUT) {
			const output = `packages<<EOF\n${affectedRunnables}\nEOF\n`;
			await Bun.write(process.env.GITHUB_OUTPUT, output);
		}

		if (affectedRunnables.length === 0) {
			console.log("No affected packages found");
		} else {
			// Output clean list for bash capture
			console.log("Affected packages:");
			console.log(affectedRunnables);
		}

		process.exit(0);
	} catch (error) {
		console.error("Error getting affected packages:", error);
		process.exit(1);
	}
}

attachAffectedToGithubOutput();
