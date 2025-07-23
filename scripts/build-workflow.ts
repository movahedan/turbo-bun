#!/usr/bin/env bun

/**
 * Build Workflow Script
 * Complete workflow: tsc → generate entries → vite build → update package.json
 */

import { join } from "node:path";
import { $ } from "bun";
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";

const config = {
	name: "Build Workflow",
	description: `Complete build workflow:
	1. Run tsc --project tsconfig.build.json
	2. Generate Vite entries from dist files
	3. Run Vite build
	4. Update package.json exports`,
	usage: "bun run build-workflow [--package <name>] [--dry-run]",
	examples: [
		"bun run build-workflow --package ui",
		"bun run build-workflow --package ui --dry-run",
	],
	options: [
		{
			short: "-p",
			long: "--package",
			description: "Package name to process (e.g., ui, utils)",
			required: true,
			validator: validators.nonEmpty,
		},
		{
			short: "-n",
			long: "--dry-run",
			description: "Show what would be done without actually doing it",
			required: false,
			validator: validators.boolean,
		},
	],
} as const;

const generateViteEntries = async (distDir: string, packageDir: string) => {
	console.log("📝 Generating Vite entries from dist files...");

	// Find all .js files in dist (excluding test files)
	const jsFiles =
		await $`find ${distDir} -name "*.js" -not -name "*.test.js" -not -name "*.spec.js"`.text();
	const entries: Record<string, string> = {};

	for (const file of jsFiles.trim().split("\n")) {
		if (!file) continue;

		const relativePath = file.replace(distDir, "").replace(/^\/+/, "");
		const withoutExtension = relativePath.replace(/\.js$/, "");

		// Convert dist path back to source path
		// The dist structure has ui/src/ and utils/src/ directories
		// We need to map these back to the actual source files

		let finalSourcePath: string;

		if (withoutExtension.startsWith("utils/")) {
			// Utils files should point to the utils package source
			const utilsSourcePath = withoutExtension.replace(/^utils\//, "");
			const utilsDir = join(packageDir, "../utils");
			const tsxPath = `${utilsDir}/${utilsSourcePath}.tsx`;
			const tsPath = `${utilsDir}/${utilsSourcePath}.ts`;

			// Check if .tsx exists, otherwise use .ts
			finalSourcePath =
				await $`test -f ${tsxPath} && echo ${tsxPath} || echo ${tsPath}`
					.text()
					.then((result) => result.trim());
		} else {
			// UI files should point to the UI package source
			const sourcePath = withoutExtension.replace(/^ui\//, "");
			const tsxPath = `${packageDir}/${sourcePath}.tsx`;
			const tsPath = `${packageDir}/${sourcePath}.ts`;

			// Check if .tsx exists, otherwise use .ts
			finalSourcePath =
				await $`test -f ${tsxPath} && echo ${tsxPath} || echo ${tsPath}`
					.text()
					.then((result) => result.trim());
		}

		// Use the original dist path as the entry key
		entries[withoutExtension] = finalSourcePath;
	}

	return entries;
};

const generatePackageExports = async (distDir: string) => {
	console.log("📦 Generating package exports from dist files...");

	// Find all .d.ts files in dist (excluding test files)
	const dtsFiles =
		await $`find ${distDir} -name "*.d.ts" -not -name "*.test.d.ts" -not -name "*.spec.d.ts"`.text();
	const exports: Record<
		string,
		{ types: string; import: string; require: string }
	> = {};

	for (const file of dtsFiles.trim().split("\n")) {
		if (!file) continue;

		const relativePath = file.replace(distDir, "").replace(/^\/+/, "");
		const withoutExtension = relativePath.replace(/\.d\.ts$/, "");

		// Map the dist path to the expected export path
		// For example: ui/src/button/button.d.ts -> ./button
		let exportPath = `./${withoutExtension}`;

		// Handle special cases for component exports
		if (withoutExtension === "ui/src/button/button") {
			exportPath = "./button";
		} else if (withoutExtension === "ui/src/link/link") {
			exportPath = "./link";
		} else if (withoutExtension === "ui/src/counter-button/counter-button") {
			exportPath = "./counter-button";
		}

		exports[exportPath] = {
			types: `./dist/${withoutExtension}.d.ts`,
			import: `./dist/${withoutExtension}.js`,
			require: `./dist/${withoutExtension}.cjs`,
		};
	}

	return exports;
};

const updatePackageJson = async (
	exports: Record<string, unknown>,
	packageDir: string,
) => {
	console.log("📄 Updating package.json exports...");

	const packageJsonPath = join(packageDir, "package.json");
	const packageJson = JSON.parse(await Bun.file(packageJsonPath).text());

	packageJson.exports = exports;

	await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
	console.log("✅ Updated package.json exports");
};

const script = createScript(config, async (args) => {
	const packageName = args.package;
	const isDryRun = args["dry-run"] || false;

	// Calculate paths relative to the package directory
	const packageDir = join(__dirname, "../packages", packageName);
	const distDir = join(packageDir, "dist");

	console.log(`🚀 Starting build workflow for package: ${packageName}`);

	if (isDryRun) {
		console.log("🔍 Dry run mode - showing what would be done");
	}

	try {
		// Step 1: Run TypeScript build
		console.log("\n📝 Step 1: Running TypeScript build...");
		if (!isDryRun) {
			await $`rm -rf ${distDir}`;
			await $`cd ${packageDir} && bun run tsc --project tsconfig.build.json`;
			console.log("✅ TypeScript build completed");
		} else {
			console.log("📝 Would run: bun run tsc --project tsconfig.build.json");
		}

		// Step 2: Generate Vite entries
		console.log("\n📝 Step 2: Generating Vite entries...");
		const viteEntries = await generateViteEntries(distDir, packageDir);
		console.log(`✅ Generated ${Object.keys(viteEntries).length} Vite entries`);

		if (!isDryRun) {
			await Bun.write(
				join(packageDir, "vite-entries.generated.json"),
				JSON.stringify(viteEntries, null, 2),
			);
			console.log("✅ Saved vite-entries.json");
		}

		// Step 3: Run Vite build
		console.log("\n⚡ Step 3: Running Vite build...");
		if (!isDryRun) {
			await $`cd ${packageDir} && bun run build:vite -- --emptyOutDir=false`;
			console.log("✅ Vite build completed");
		} else {
			console.log("⚡ Would run: bun run build");
		}

		// Step 4: Generate and update package.json exports
		console.log("\n📦 Step 4: Updating package.json exports...");
		const packageExports = await generatePackageExports(distDir);
		console.log(
			`✅ Generated ${Object.keys(packageExports).length} package exports`,
		);

		if (!isDryRun) {
			await updatePackageJson(packageExports, packageDir);
		}

		// Step 5: Clean up temporary files
		console.log("\n🧹 Step 5: Cleaning up temporary files...");
		if (!isDryRun) {
			await $`rm -f ${packageDir}/package-exports.json`;
			console.log("✅ Cleaned up temporary files");
			await $`bunx @biomejs/biome check --write --no-errors-on-unmatched ${packageDir}`;
		} else {
			console.log("🧹 Would remove: vite-entries.json, package-exports.json");
		}

		console.log("\n🎉 Build workflow completed successfully!");
	} catch (error) {
		console.error("❌ Build workflow failed:", error);
		process.exit(1);
	}
});

script();
