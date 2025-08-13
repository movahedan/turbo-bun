/** biome-ignore-all lint/complexity/noUselessConstructor: it's a simple util class */

import { readFileSync } from "node:fs";
import { $ } from "bun";
import type { PackageJson } from "type-fest";

export class EntityPackageJson {
	constructor() {}

	static getDir(packageName: string): string {
		if (packageName === "root") return ".";
		if (packageName.startsWith("@repo/")) return `packages/${packageName.replace("@repo/", "")}`;
		return `apps/${packageName}`;
	}

	static getJsonPath(packageName: string): string {
		return `${EntityPackageJson.getDir(packageName)}/package.json`;
	}

	static getChangelogPath(packageName: string): string {
		if (packageName === "root") return "CHANGELOG.md";
		if (packageName.startsWith("@repo/"))
			return `packages/${packageName.replace("@repo/", "")}/CHANGELOG.md`;
		return `apps/${packageName}/CHANGELOG.md`;
	}

	static getPackageJson(packageName: string): PackageJson {
		const jsonPath = EntityPackageJson.getJsonPath(packageName);
		const jsonFile = readFileSync(jsonPath, "utf8");
		return JSON.parse(jsonFile);
	}

	static async writePackageJson(packageName: string, content: PackageJson): Promise<void> {
		const jsonPath = EntityPackageJson.getJsonPath(packageName);
		const jsonFile = Bun.file(jsonPath);
		await jsonFile.write(JSON.stringify(content, null, 2));
		await $`bun biome check --write --no-errors-on-unmatched ${jsonPath}`;
	}

	static async bumpVersion(packageName: string, newVersion: string): Promise<void> {
		const content = EntityPackageJson.getPackageJson(packageName);
		content.version = newVersion;
		await EntityPackageJson.writePackageJson(packageName, content);
	}

	static getVersion(packageName: string): string {
		const content = EntityPackageJson.getPackageJson(packageName);
		return content.version ?? "0.0.0";
	}

	static async writeChangelog(packageName: string, newChangelog: string): Promise<string> {
		const path = EntityPackageJson.getChangelogPath(packageName);
		await Bun.write(path, newChangelog);
		return path;
	}

	static getChangelog(packageName: string): string {
		const path = EntityPackageJson.getChangelogPath(packageName);

		try {
			return readFileSync(path, "utf8");
		} catch (error) {
			console.warn(`Failed to read changelog for ${packageName}: ${error}`);
			return "";
		}
	}
}
