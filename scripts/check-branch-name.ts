import { git } from "./git-command";

const branchName =
	process.env.GITHUB_HEAD_REF ||
	process.env.GITHUB_REF?.replace("refs/heads/", "") ||
	git(["branch", "--show-current"]).stdout.trim() ||
	"";

const validBranchPrefixes = [
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

const showHelp = () => {
	console.error("❌ Invalid branch name!");
	console.error("\nBranch name should follow one of these patterns:");
	for (const prefix of validBranchPrefixes) {
		if (prefix === "release") {
			console.error(`- ${prefix}/1.0.0`);
		} else {
			console.error(`- ${prefix}/your-${prefix}-name`);
		}
	}
	process.exit(1);
};

// Branch naming patterns
const patterns = validBranchPrefixes.reduce(
	(acc, prefix) => {
		acc[prefix] = new RegExp(`^${prefix}/([a-z0-9.-]+)$`);
		return acc;
	},
	{} as Record<(typeof validBranchPrefixes)[number], RegExp>,
);

const isValidBranchName = (name: string): boolean => {
	console.log(name);
	console.log(Object.values(patterns).some((pattern) => pattern.test(name)));

	return Object.values(patterns).some((pattern) => pattern.test(name));
};

if (isValidBranchName(branchName)) {
	console.log("✅ Branch name is valid!");
	process.exit(0);
}

showHelp();
