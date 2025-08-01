#!/usr/bin/env bun

import { readFileSync, writeFileSync } from "node:fs";
import { $ } from "bun";
import chalk from "chalk";
import { getAffectedPackages } from "./affected";
import { createScript } from "./utils/create-scripts";

interface ChangesetEntry {
	packages: Record<string, "patch" | "minor" | "major">;
	summary: string;
}

interface ChangesetFile {
	filename: string;
	content: ChangesetEntry;
}

const versionAddAutoConfig = {
	name: "Version Add Auto",
	description: "Automatically create changesets based on affected packages",
	usage: "bun run version:add-auto",
	examples: ["bun run version:add-auto"],
	options: [
		{
			short: "-b",
			long: "--base-sha",
			description: "The base SHA to use for affected package detection",
			required: false,
			defaultValue: "origin/main",
			validator: (value: string) => value.length > 0,
		},
	],
} as const;

export async function readExistingChangesets(
	xConsole: typeof console,
): Promise<ChangesetFile[]> {
	const changesetFiles: ChangesetFile[] = [];

	try {
		const files =
			await $`find .changeset -name "*.md" -not -name "README.md"`.text();
		const fileList = files.split("\n").filter(Boolean);

		for (const filename of fileList) {
			const content = readFileSync(filename, "utf8");
			const lines = content.split("\n");

			// Parse changeset content
			const packages: Record<string, "patch" | "minor" | "major"> = {};
			let summary = "";
			let inSummary = false;

			for (const line of lines) {
				if (line.startsWith('"') && line.includes('":')) {
					// Package line
					const match = line.match(/"([^"]+)":\s*(patch|minor|major)/);
					if (match) {
						packages[match[1]] = match[2] as "patch" | "minor" | "major";
					}
				} else if (line === "---") {
					inSummary = !inSummary;
				} else if (inSummary && line.trim()) {
					summary += `${line}\n`;
				}
			}

			changesetFiles.push({
				filename,
				content: { packages, summary: summary.trim() },
			});
		}
	} catch (error) {
		xConsole.warn(error);
		// No changeset files exist yet
	}

	return changesetFiles;
}

async function createChangeset(
	packages: Record<string, "patch" | "minor" | "major">,
	summary: string,
): Promise<string> {
	// Generate unique filename
	const timestamp = Date.now();
	const filename = `auto-${timestamp}.md`;
	const filepath = `.changeset/${filename}`;

	// Create changeset content
	let content = "---\n";
	for (const [pkg, type] of Object.entries(packages)) {
		content += `"${pkg}": ${type}\n`;
	}
	content += "---\n\n";
	content += summary;

	writeFileSync(filepath, content);
	return filename;
}

export const versionAddAuto = createScript(
	versionAddAutoConfig,
	async function main(options, xConsole) {
		xConsole.info(
			chalk.blue("🔍 Analyzing changes for automated changeset creation..."),
		);

		const affectedPackages = await getAffectedPackages(options["base-sha"]);
		xConsole.log(
			chalk.blue(
				`📦 Found ${affectedPackages.length} affected packages: ${affectedPackages.join(", ")}`,
			),
		);

		// Filter to only packages that have version fields
		const packagesWithVersions = affectedPackages.filter((pkg) => {
			try {
				const packageJsonPath = pkg.startsWith("@repo/")
					? `packages/${pkg.replace("@repo/", "")}/package.json`
					: `apps/${pkg}/package.json`;
				const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
				return packageJson.version !== undefined;
			} catch {
				return false;
			}
		});

		xConsole.log(
			chalk.blue(
				`📦 Found ${packagesWithVersions.length} versioned packages: ${packagesWithVersions.join(", ")}`,
			),
		);

		if (packagesWithVersions.length === 0) {
			xConsole.log(chalk.yellow("⚠️  No versioned package changes detected"));
			return;
		}

		// Read existing changesets
		const existingChangesets = await readExistingChangesets(xConsole);
		xConsole.log(
			chalk.blue(`📋 Found ${existingChangesets.length} existing changesets`),
		);

		// Determine what needs to be added
		const packagesToAdd: Record<string, "patch" | "minor" | "major"> = {};

		for (const pkg of packagesWithVersions) {
			// Check if package already has a changeset
			let hasChangeset = false;
			for (const changeset of existingChangesets) {
				if (changeset.content.packages[pkg]) {
					hasChangeset = true;
					break;
				}
			}

			if (!hasChangeset) {
				packagesToAdd[pkg] = "patch";
			}
		}

		// Create new changeset if needed
		if (Object.keys(packagesToAdd).length > 0) {
			const summary = `Automated version bump for: ${Object.keys(packagesToAdd).join(", ")}\n\nChanges detected in merge request pipeline.`;

			const filename = await createChangeset(packagesToAdd, summary);

			xConsole.log(chalk.green(`✅ Created changeset: ${filename}`));
			for (const [pkg, type] of Object.entries(packagesToAdd)) {
				xConsole.log(chalk.cyan(`   • ${pkg}: ${type}`));
			}
		} else {
			xConsole.log(
				chalk.green("✅ All changed packages already have changesets"),
			);
		}

		xConsole.log(
			chalk.cyan(
				"📋 Run 'bun run version:commit && git push' to generate changelog and push changes",
			),
		);
		xConsole.log(
			chalk.yellow(
				"💡 Tip: You can also create changesets manually with 'bun run version:add'",
			),
		);
	},
);

if (import.meta.main) {
	versionAddAuto();
}
