import { spawnSync } from "node:child_process";

// Get current branch name from git
const getCurrentBranch = () => {
	const result = spawnSync("git", ["branch", "--show-current"], {
		encoding: "utf-8",
	});
	return result.stdout.trim();
};

const branchName =
	process.env.GITHUB_HEAD_REF ||
	process.env.GITHUB_REF?.replace("refs/heads/", "") ||
	getCurrentBranch() ||
	"";

const branchPrefixes = [
	"release",

	"feature",
	"fix",
	"hotfix",
	"docs",
	"refactor",
	"ci",
	"chore",
	"wip",

	"renovate",
] as const;

// Branch naming patterns
const patterns = branchPrefixes.reduce(
	(acc, prefix) => {
		acc[prefix] = new RegExp(`^${prefix}/([a-z0-9-]+)$`);
		return acc;
	},
	{} as Record<(typeof branchPrefixes)[number], RegExp>,
);

const isValidBranchName = (name: string): boolean => {
	return Object.values(patterns).some((pattern) => pattern.test(name));
};

if (!isValidBranchName(branchName)) {
	console.error("❌ Invalid branch name!");
	console.error("\nBranch name should follow one of these patterns:");
	for (const prefix of branchPrefixes) {
		if (prefix === "release") {
			console.error(`- ${prefix}/1.0.0`);
		} else {
			console.error(`- ${prefix}/your-${prefix}-name`);
		}
	}
	process.exit(1);
}

console.log("✅ Branch name is valid!");
process.exit(0);
