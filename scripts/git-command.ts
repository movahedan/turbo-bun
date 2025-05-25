import { spawnSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Use explicit PATH that only includes system binaries
const PATH = "/usr/local/bin:/usr/bin:/bin";

// Try to find git in common locations
const gitLocations = [
	"/usr/bin/git",
	"/usr/local/bin/git",
	join(homedir(), "homebrew/bin/git"),
];

const findGitPath = () => {
	for (const path of gitLocations) {
		try {
			accessSync(path, constants.X_OK);
			return path;
		} catch {
			// Continue to next path if current one is not accessible
		}
	}

	console.error("❌ Git not found in common locations");
	process.exit(1);
};

export const git = (args: string[]) => {
	const gitPath = findGitPath();

	const result = spawnSync(gitPath, args, {
		encoding: "utf-8",
		env: { PATH }, // Explicitly set PATH
	});

	if (result.error) {
		console.error("Error executing git command:", result.error);
		process.exit(1);
	}

	return result;
};
