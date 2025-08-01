#!/usr/bin/env bun
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

export interface PackageJson {
	name: string;
	version: string;
	[key: string]: unknown;
}

export interface ChangelogEntry {
	version: string;
	date: string;
	changes: string[];
	type: "patch" | "minor" | "major";
}

export async function isUpToDate(): Promise<boolean> {
	try {
		await $`git fetch origin`;
		const localCommit = await $`git rev-parse HEAD`.text();
		const remoteCommit = await $`git rev-parse origin/main`.text();
		return localCommit.trim() === remoteCommit.trim();
	} catch {
		return false;
	}
}

export function getRootVersion(): string {
	const packageJson = JSON.parse(
		readFileSync("package.json", "utf8"),
	) as PackageJson;
	return packageJson.version;
}

export function bumpVersion(
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

export async function getAllPackages(): Promise<PackageJson[]> {
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
		const packageDirs = await $`find packages -maxdepth 1 -type d`.text();
		const dirs = packageDirs.split("\n").filter(Boolean);
		dirs.forEach(findPackages);
	}

	// Check apps directory
	if (existsSync("apps")) {
		const appDirs = await $`find apps -maxdepth 1 -type d`.text();
		const dirs = appDirs.split("\n").filter(Boolean);
		dirs.forEach(findPackages);
	}

	return packages;
}

// Git tag-based version tracking functions
const VERSION_TAG_PREFIX = "v";

/**
 * Get the last versioning commit SHA using Git tags
 * Uses the latest version tag to find the commit SHA
 * If no version tags exist, returns the initial commit SHA
 */
export async function getLastVersioningCommit(): Promise<string> {
	try {
		// Get all version tags (v*)
		const tags =
			await $`git tag --list "${VERSION_TAG_PREFIX}*" --sort=-version:refname`.text();
		const tagList = tags.split("\n").filter(Boolean);

		if (tagList.length === 0) {
			// No version tags found, return the initial commit SHA
			const initialCommit = await $`git rev-list --max-parents=0 HEAD`.text();
			return initialCommit.trim();
		}

		// Get the latest version tag
		const latestTag = tagList[0];

		// Get the commit SHA that this tag points to
		// Using git rev-list -n 1 as recommended in Stack Overflow
		const commitSha = await $`git rev-list -n 1 ${latestTag}`.text();

		return commitSha.trim();
	} catch {
		// Fallback to initial commit if anything goes wrong
		const initialCommit = await $`git rev-list --max-parents=0 HEAD`.text();
		return initialCommit.trim();
	}
}

/**
 * Create a version tag for the current commit
 */
export async function createVersionTag(version: string): Promise<void> {
	const tagName = `${VERSION_TAG_PREFIX}${version}`;

	// Check if tag already exists
	const existingTag = await $`git tag --list "${tagName}"`.text();
	if (existingTag.trim()) {
		throw new Error(`Tag ${tagName} already exists`);
	}

	// Create annotated tag
	await $`git tag -a ${tagName} -m "Release version ${version}"`.text();

	// Push the tag
	await $`git push origin ${tagName}`.text();
}

/**
 * Get the latest version from Git tags
 */
export async function getLatestVersion(): Promise<string | null> {
	try {
		const tags =
			await $`git tag --list "${VERSION_TAG_PREFIX}*" --sort=-version:refname`.text();
		const tagList = tags.split("\n").filter(Boolean);

		if (tagList.length === 0) {
			return null;
		}

		// Extract version from tag (remove v prefix)
		const latestTag = tagList[0];
		return latestTag.replace(VERSION_TAG_PREFIX, "");
	} catch {
		return null;
	}
}
