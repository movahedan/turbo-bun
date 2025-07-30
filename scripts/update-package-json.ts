#!/usr/bin/env bun
import { readdir } from "node:fs/promises";
import path from "node:path";
import { $ } from "bun";
import chalk from "chalk";
import { type ScriptConfig, validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";

const updatePackageJsonConfig = {
	name: "update-package-json",
	description:
		"Update the package.json exports attributes based on the files in the package",
	usage: "bun run update-package-json [options]",
	examples: ["bun run update-package-json"],
	options: [
		{
			short: "-s",
			long: "--src",
			description: "Are you using src directory? (default: true)",
			required: false,
			defaultValue: true,
			validator: validators.boolean,
		},
	],
} as const satisfies ScriptConfig;

export const updatePackageJson = createScript(
	updatePackageJsonConfig,
	async function run(args, vConsole) {
		vConsole.log(chalk.blue("🧹 Starting package.json update..."));

		vConsole.log(chalk.blue("🔍 Finding package.json..."));
		const packageJsonPath = path.join(process.cwd(), "package.json");
		vConsole.log(chalk.blue(`🔍 Found package.json at ${packageJsonPath}`));

		const packageDir = path.dirname(packageJsonPath);
		const srcDir = args.src ? path.join(packageDir, "src") : packageDir;
		const files = await readdir(srcDir, {
			withFileTypes: true,
			recursive: false,
		});

		vConsole.log(
			chalk.blue(`🔍 Found ${files.length} exportable modules:`),
			chalk.cyan(files.map((f) => f.name).join(" ")),
		);

		async function getNewExports() {
			const newExports: Record<string, string> = {};

			for (const file of files) {
				const shouldSkip =
					!file.isDirectory() &&
					!file.name.endsWith(".ts") &&
					!file.name.endsWith(".tsx");
				if (shouldSkip) continue;

				if (file.name === "index.ts") {
					newExports["."] = "./index.ts";
					continue;
				}

				const mainFile = file.isDirectory()
					? path.join(srcDir, file.name, `${file.name}.tsx`)
					: path.join(srcDir, file.name);
				const relativePath = `./${path.relative(packageDir, mainFile)}`;

				if (await Bun.file(mainFile).exists()) {
					newExports[`./${file.name}`] = relativePath;
				}
			}

			return newExports;
		}
		const newExports = await getNewExports();

		if (args["dry-run"]) {
			vConsole.log(chalk.yellow("🔍 Dry run mode, skipping write:"));
			vConsole.log(JSON.stringify(newExports, null, 2));
			return;
		}

		const packageJson = JSON.parse(await Bun.file(packageJsonPath).text());
		packageJson.exports = newExports;

		await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
		await $`bun biome check --write --no-errors-on-unmatched ${packageJsonPath}`;
		vConsole.log(chalk.green("✅ Package.json updated successfully"));
	},
);

if (import.meta.main) {
	updatePackageJson();
}
