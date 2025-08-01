#!/usr/bin/env bun
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";

interface PackageJson {
	name: string;
	version: string;
	[key: string]: any;
}

interface ChangelogEntry {
	version: string;
	date: string;
	changes: string[];
	type: "patch" | "minor" | "major";
}

const versionScriptConfig = {
	name: "Version Management",
	description: "Custom version management for the monorepo",
	usage: "bun run version:init|add|commit|push [options]",
	examples: [
		"bun run version:init",
		"bun run version:add --minor",
		"bun run version:add --major",
		"bun run version:add --patch",
		"bun run version:commit",
		"bun run version:push",
	],
	options: [
		{
			short: "-m",
			long: "--minor",
			description: "Bump minor version",
			required: false,
			validator: validators.boolean,
		},
		{
			short: "-M",
			long: "--major",
			description: "Bump major version",
			required: false,
			validator: validators.boolean,
		},
		{
			short: "-p",
			long: "--patch",
			description: "Bump patch version",
			required: false,
			validator: validators.boolean,
		},
	],
} as const;

// Utility functions
function getCurrentBranch(): string {
	return execSync("git branch --show-current", { encoding: "utf8" }).trim();
}

function isUpToDate(): boolean {
	try {
		execSync("git fetch origin", { stdio: "pipe" });
		const localCommit = execSync("git rev-parse HEAD", {
			encoding: "utf8",
		}).trim();
		const remoteCommit = execSync("git rev-parse origin/main", {
			encoding: "utf8",
		}).trim();
		return localCommit === remoteCommit;
	} catch {
		return false;
	}
}

function getRootVersion(): string {
	const packageJson = JSON.parse(
		readFileSync("package.json", "utf8"),
	) as PackageJson;
	return packageJson.version;
}

function bumpVersion(
	version: string,
	type: "patch" | "minor" | "major",
): string {
	const [major, minor, patch] = version.split(".").map(Number);

	switch (type) {
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "major":
			return `${major + 1}.0.0`;
		default:
			throw new Error(`Invalid version type: ${type}`);
	}
}

function getAllPackages(): PackageJson[] {
	const packages: PackageJson[] = [];

	// Add root package
	packages.push(
		JSON.parse(readFileSync("package.json", "utf8")) as PackageJson,
	);

	// Find all package.json files in packages and apps
	const findPackages = (dir: string) => {
		if (existsSync(join(dir, "package.json"))) {
			packages.push(
				JSON.parse(
					readFileSync(join(dir, "package.json"), "utf8"),
				) as PackageJson,
			);
		}
	};

	// Check packages directory
	if (existsSync("packages")) {
		const packageDirs = execSync("find packages -maxdepth 1 -type d", {
			encoding: "utf8",
		})
			.split("\n")
			.filter(Boolean);

		packageDirs.forEach(findPackages);
	}

	// Check apps directory
	if (existsSync("apps")) {
		const appDirs = execSync("find apps -maxdepth 1 -type d", {
			encoding: "utf8",
		})
			.split("\n")
			.filter(Boolean);

		appDirs.forEach(findPackages);
	}

	return packages;
}

function generateChangelog(
	packages: PackageJson[],
	type: "patch" | "minor" | "major",
): void {
	const date = new Date().toISOString().split("T")[0];
	const entry: ChangelogEntry = {
		version: bumpVersion(getRootVersion(), type),
		date,
		changes: [],
		type,
	};

	// Generate changes based on git commits since last tag
	try {
		const lastTag = execSync("git describe --tags --abbrev=0", {
			encoding: "utf8",
		}).trim();
		const commits = execSync(`git log ${lastTag}..HEAD --oneline`, {
			encoding: "utf8",
		})
			.split("\n")
			.filter(Boolean)
			.map((line) => line.split(" ", 2)[1])
			.filter(Boolean);

		entry.changes = commits;
	} catch {
		// No tags found, use all commits
		const commits = execSync("git log --oneline", { encoding: "utf8" })
			.split("\n")
			.filter(Boolean)
			.map((line) => line.split(" ", 2)[1])
			.filter(Boolean);

		entry.changes = commits.slice(0, 10); // Limit to last 10 commits
	}

	// Write changelog entry
	const changelogPath = "CHANGELOG.md";
	let changelog = "";

	if (existsSync(changelogPath)) {
		changelog = readFileSync(changelogPath, "utf8");
	}

	const newEntry = `## [${entry.version}] - ${entry.date}

### ${type.charAt(0).toUpperCase() + type.slice(1)} Changes

${entry.changes.map((change) => `- ${change}`).join("\n")}

---

`;

	writeFileSync(changelogPath, newEntry + changelog);
}

export const versionScript = createScript(
	versionScriptConfig,
	async function main(args, xConsole) {
		const command = process.argv[2];

		switch (command) {
			case "init":
				await handleInit(xConsole);
				break;
			case "add":
				await handleAdd(args, xConsole);
				break;
			case "commit":
				await handleCommit(xConsole);
				break;
			case "push":
				await handlePush(xConsole);
				break;
			default:
				throw new Error(
					`Unknown command: ${command}. Use: init, add, commit, or push`,
				);
		}
	},
);

async function handleInit(xConsole: typeof console) {
	xConsole.info("🔍 Checking git status...");

	// Check if we're on main branch
	const currentBranch = getCurrentBranch();
	if (currentBranch !== "main") {
		throw new Error(`Must be on main branch, currently on: ${currentBranch}`);
	}

	// Check if up to date
	if (!isUpToDate()) {
		throw new Error("Local main branch is not up to date with origin/main");
	}

	// Check for uncommitted changes
	const status = execSync("git status --porcelain", { encoding: "utf8" });
	if (status.trim()) {
		throw new Error(
			"Working directory is not clean. Please commit or stash changes.",
		);
	}

	// Get current version
	const currentVersion = getRootVersion();
	xConsole.info(`📦 Current version: ${currentVersion}`);

	// Create release branch
	const releaseBranch = `release/${currentVersion}`;
	execSync(`git checkout -b ${releaseBranch}`);

	xConsole.log(`✅ Created release branch: ${releaseBranch}`);
	xConsole.log("🚀 Ready to add changes and commit version bump!");
}

async function handleAdd(args: any, xConsole: typeof console) {
	const { minor, major, patch } = args;

	// Determine version type
	let type: "patch" | "minor" | "major" = "patch";
	if (major) type = "major";
	else if (minor) type = "minor";
	else if (patch) type = "patch";

	xConsole.info(`📝 Generating changelog for ${type} version...`);

	// Get all packages
	const packages = getAllPackages();
	xConsole.log(`📦 Found ${packages.length} packages to process`);

	// Generate changelog
	generateChangelog(packages, type);

	xConsole.log("✅ Changelog generated successfully!");
	xConsole.log(
		"📋 Review CHANGELOG.md and run 'bun run version:commit' to proceed",
	);
}

async function handleCommit(xConsole: typeof console) {
	xConsole.info("🏷️ Bumping root version...");

	// Read current version
	const packageJson = JSON.parse(
		readFileSync("package.json", "utf8"),
	) as PackageJson;
	const currentVersion = packageJson.version;

	// Determine new version from changelog
	const changelog = readFileSync("CHANGELOG.md", "utf8");
	const versionMatch = changelog.match(/## \[([^\]]+)\]/);
	if (!versionMatch) {
		throw new Error(
			"No version found in CHANGELOG.md. Run 'bun run version:add' first.",
		);
	}

	const newVersion = versionMatch[1];

	// Update root package.json
	packageJson.version = newVersion;
	writeFileSync("package.json", `${JSON.stringify(packageJson, null, "\t")}\n`);

	// Commit changes
	execSync("git add .");
	execSync(`git commit -m "chore(release): bump version to ${newVersion}"`);

	xConsole.log(`✅ Version bumped from ${currentVersion} to ${newVersion}`);
	xConsole.log("🚀 Ready to push with 'bun run version:push'");
}

async function handlePush(xConsole: typeof console) {
	xConsole.info("🚀 Pushing release branch...");

	// Get current branch
	const currentBranch = getCurrentBranch();
	if (!currentBranch.startsWith("release/")) {
		throw new Error("Must be on a release branch to push");
	}

	// Push the branch
	execSync(`git push origin ${currentBranch}`);

	xConsole.log(`✅ Pushed release branch: ${currentBranch}`);
	xConsole.log("📋 Create a pull request to merge this release");
}

if (import.meta.main) {
	versionScript();
}
