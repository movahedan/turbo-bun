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
