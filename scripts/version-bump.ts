#!/usr/bin/env bun

import { colorify } from "./shell/colorify";
import { createScript, type ScriptConfig, validators } from "./shell/create-scripts";
import { repoUtils } from "./shell/repo-utils";
import { type VersionBumpType, VersionUtils } from "./shell/version-utils";

const scriptConfig = {
	name: "Version Bump",
	description: "Bump versions for packages based on commit analysis",
	usage: "bun run version-bump.ts [options]",
	examples: [
		"bun run version-bump.ts --type patch",
		"bun run version-bump.ts --type minor --package admin",
		"bun run version-bump.ts --auto",
	],
	options: [
		{
			short: "-t",
			long: "--type",
			description: "Version bump type (major, minor, patch), otherwise auto-detect",
			required: false,
			validator: (value) => ["major", "minor", "patch"].includes(value),
		},
		{
			short: "-p",
			long: "--package",
			description: "Bump specific package version",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-f",
			long: "--from",
			description: "Analyze commits from specific version/tag - defaults to base tag",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-t",
			long: "--to",
			description: "End at specific version/tag - defaults to HEAD",
			required: false,
			defaultValue: "HEAD",
			validator: validators.nonEmpty,
		},
	],
} as const satisfies ScriptConfig;

interface VersionBumpInfo {
	readonly packageName: string;
	readonly currentVersion: string;
	readonly newVersion: string;
	readonly bumpType: VersionBumpType;
}

export const versionBump = createScript(scriptConfig, async function main(args, xConsole) {
	xConsole.log("🔢 Analyzing version bumps...");

	const versionUtils = new VersionUtils();
	const bumpInfos: VersionBumpInfo[] = [];
	if (args.package) {
		const bumpType =
			args.type || (await versionUtils.detectBumpType(args.package, args.from, args.to));
		bumpInfos.push(await getBumpInfo(args.package, bumpType as VersionBumpType, versionUtils));
	} else {
		const from = await repoUtils.tags.baseTagSha(args.from);
		const affected = await repoUtils.affected(from).packages(args.to);
		xConsole.log(`📦 Found ${affected.length} affected packages: ${affected.join(", ")}`);

		const results = await Promise.all(
			affected.map(async (pkg) => {
				const bumpType = await versionUtils.detectBumpType(pkg, args.from, args.to);
				if (!bumpType) {
					return undefined;
				}

				return getBumpInfo(pkg, bumpType, versionUtils);
			}),
		);
		results.forEach((result) => {
			if (result) {
				bumpInfos.push(result);
			}
		});
	}
	if (bumpInfos.length === 0) {
		xConsole.log(colorify.yellow("⚠️ No packages to bump"));
		return;
	}

	xConsole.log("📊 Planned version changes:");
	xConsole.table(
		bumpInfos.map((info) => ({
			package: info.packageName,
			current: info.currentVersion,
			next: info.newVersion,
			type: info.bumpType,
		})),
	);

	if (args["dry-run"]) {
		xConsole.log(colorify.yellow("\n🔍 Dry run completed - no changes made"));
		return;
	}
	xConsole.log("\n🔄 Applying version bumps...");
	for (const info of bumpInfos) {
		try {
			await repoUtils.packageJson(info.packageName).bump(info.newVersion);
			xConsole.log(`\t✅ ${info.packageName}: ${info.currentVersion} → ${info.newVersion}`);
		} catch (error) {
			xConsole.error(
				`\t❌ Failed to update ${info.packageName}: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	}

	xConsole.log(colorify.green("\n✅ Version bump completed successfully!"));
});

async function getBumpInfo(
	packageName: string,
	bumpType: VersionBumpType,
	versionUtils: VersionUtils,
): Promise<VersionBumpInfo> {
	const currentVersion = await repoUtils.packageJson(packageName).version();
	const newVersion = versionUtils.getNextVersion(currentVersion, bumpType);

	return {
		packageName,
		currentVersion,
		newVersion,
		bumpType,
	};
}

if (import.meta.main) {
	versionBump();
}
