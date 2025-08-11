/** biome-ignore-all lint/complexity/noUselessConstructor: it's a simple util class */
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

	static async getPackageJson(packageName: string): Promise<PackageJson> {
		const jsonPath = EntityPackageJson.getJsonPath(packageName);
		const jsonFile = Bun.file(jsonPath);
		return await jsonFile.json();
	}

	static async writePackageJson(packageName: string, content: PackageJson): Promise<void> {
		const jsonPath = EntityPackageJson.getJsonPath(packageName);
		const jsonFile = Bun.file(jsonPath);
		await jsonFile.write(JSON.stringify(content, null, 2));
		await $`bun biome check --write --no-errors-on-unmatched ${jsonPath}`;
	}

	static async bumpVersion(packageName: string, newVersion: string): Promise<void> {
		const content = await EntityPackageJson.getPackageJson(packageName);
		content.version = newVersion;
		await EntityPackageJson.writePackageJson(packageName, content);
	}

	static async getVersion(packageName: string): Promise<string> {
		const content = await EntityPackageJson.getPackageJson(packageName);
		return content.version ?? "0.0.0";
	}

	static async writeChangelog(packageName: string, newChangelog: string): Promise<string> {
		const path = EntityPackageJson.getChangelogPath(packageName);
		await Bun.write(path, newChangelog);
		return path;
	}

	static async getChangelog(packageName: string): Promise<string> {
		const path = EntityPackageJson.getChangelogPath(packageName);
		const file = Bun.file(path);
		const exists = await file.exists();

		if (!exists) {
			return "";
		}

		return await file.text();
	}
}
