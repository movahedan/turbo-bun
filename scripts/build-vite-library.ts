#!/usr/bin/env bun

/**
 * Build Vite Library Script
 * Complete workflow: tsc → generate entries → vite build → update package.json
 */
import { join, resolve } from "node:path";
import { $ } from "bun";
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";

const SRC_DIR = "src";
interface TsConfig {
	compilerOptions: {
		rootDir: string;
	};
}

/**
 * Generate Vite entries and package.json exports - coupled with tsconfig(.build).json of your package
 * It reads the output of the tsc build and generates the vite entries and package.json exports attribute
 * Optimized for tree-shaking and just-in-time packages, also supports typescript sourcemap files.
 *
 * Vite entry - let vite compile everything including just-in-time packages
 * Package.json exports - only export the files that are part of the package
 */
async function getViteAndPackageExports(
	distDir: string,
	packageDir: string,
	tsconfigRootDir: string,
) {
	const jsFiles = await getJsFilesAbsolutePaths(distDir);

	const viteEntries: Record<string, string> = {};
	const packageExports: Record<
		string,
		{ types: string; import: string; require: string }
	> = {};

	for (const file of jsFiles) {
		if (!file) continue;

		// Vite entry - let vite compile everything including just-in-time packages
		const viteDestination = file.replace(`${distDir}/`, "");
		const sourceAbsPath = resolve(packageDir, tsconfigRootDir, viteDestination);
		const tsExtension = await getTsExtension(sourceAbsPath);
		const sourceFile = `${sourceAbsPath}.${tsExtension}`;

		viteEntries[viteDestination] = sourceFile;

		// Package.json exports - only export the files that are part of the package
		if (!sourceAbsPath.includes(packageDir)) continue;

		const relSourcePath = sourceAbsPath
			.replace(`${packageDir}/`, "")
			.replace(`${SRC_DIR}/`, "");
		const exportsKey = relSourcePath === "index" ? "." : `./${relSourcePath}`;
		const builtFile = file.replace(packageDir, ".");

		packageExports[exportsKey] = {
			types: `${builtFile}.d.ts`,
			import: `${builtFile}.js`,
			require: `${builtFile}.cjs`,
		};
	}

	return { viteEntries, packageExports };
}

// The main script that runs the build workflow
export const buildViteLibrary = createScript(
	{
		name: "Build Vite Library",
		description: `Complete build workflow:
	1. Run tsc --project tsconfig.build.json
	2. Generate Vite entries from dist files
	3. Run Vite build
	4. Update package.json exports`,
		usage: "bun run build-vite-library [--package <name>] [--dry-run]",
		examples: [
			"bun run build-vite-library --package ui",
			"bun run build-vite-library --package ui --dry-run",
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
				short: "-c",
				long: "--config",
				description: "Path to the tsconfig.build.json file",
				required: false,
				validator: validators.nonEmpty,
			},
			{
				short: "-g",
				long: "--generate",
				description: "Path to the file to generate the vite entries",
				required: false,
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
	} as const,
	async (args) => {
		const packageName = args.package;

		const packageDir = join(__dirname, "../packages", packageName);
		const packageJsonPath = join(packageDir, "package.json");
		const distDir = join(packageDir, "dist");

		const tsconfigPath = args.config || join(packageDir, "tsconfig.build.json");
		const tsConfig: TsConfig = JSON.parse(await Bun.file(tsconfigPath).text());
		const tsconfigRootDir = tsConfig.compilerOptions.rootDir;
		const viteEntriesPath =
			args.generate || join(packageDir, "vite-entries.generated.json");

		console.info(`🚀 Starting build workflow for package: ${packageName}`);
		const isDryRun = args["dry-run"] || false;
		if (isDryRun) {
			console.info("🔍 Dry run mode - showing what would be done");
		}

		try {
			// Step 0: Cleaning up the previous build
			console.info("\n📝 Step 0: Cleaning up the previous build...");
			await $`rm -rf ${distDir} || true`;
			await $`rm -rf ${tsconfigPath.replace("json", "tsbuildinfo")} || true`;

			// Step 1: Run TypeScript build
			console.info("\n📝 Step 1: Running TypeScript build...");
			await $`cd ${packageDir} && bun run tsc --project ${tsconfigPath}`;
			console.info("✅ TypeScript build completed");

			// Step 2: Extract information from the build
			console.info("\n📝 Step 2: Generating Vite entries and package.json...");
			const { viteEntries, packageExports } = await getViteAndPackageExports(
				distDir,
				packageDir,
				tsconfigRootDir,
			);
			console.info(
				`✅ Generated ${Object.keys(viteEntries).length} Vite entries`,
			);
			console.info(
				`✅ Generated ${Object.keys(packageExports).length} package.json exports`,
			);

			// Step 3: Save Vite entries
			console.info("\n📝 Step 3: Saving Vite entries...");
			if (!isDryRun) {
				await Bun.write(viteEntriesPath, JSON.stringify(viteEntries, null, 2));
				await $`bunx @biomejs/biome check --write ${viteEntriesPath}`;
				console.info(`✅ Saved to: ${viteEntriesPath}`);
			} else {
				const viteEntriesString = JSON.stringify(viteEntries, null, 2);
				console.info(
					`📝 Would save to: ${viteEntriesPath}\n${viteEntriesString}`,
				);
			}

			// Step 4: Run Vite build
			console.info("\n⚡ Step 4: Running Vite build...");
			if (!isDryRun) {
				await $`cd ${distDir} && rm -rf **/*.js`;
				await $`cd ${packageDir} && bun run build:vite -- --emptyOutDir=false`;
			} else {
				console.info("⚡ Would run: bun run build");
			}

			// Step 5: Update package.json exports
			console.info("\n📝 Step 5: Updating package.json exports...");
			if (!isDryRun) {
				const packageJson = JSON.parse(await Bun.file(packageJsonPath).text());
				packageJson.exports = packageExports;
				await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
				await $`bunx @biomejs/biome check --write ${packageJsonPath}`;
				console.info("✅ Updated package.json exports");
			} else {
				const exportsString = JSON.stringify(packageExports, null, 2);
				console.info(`📝 Would update: package.json exports\n${exportsString}`);
			}

			console.info("\n🎉 Build workflow completed successfully!");
		} catch (error) {
			console.error("❌ Build workflow failed:\n", error);
			process.exit(1);
		}
	},
);

if (import.meta.main) {
	buildViteLibrary();
}

// Helper functions -------------------------------------------------------------------------------

// Get the names of all the js files in the dist directory
const findJsFiles = async (distDir: string) =>
	$`find ${distDir} -name "*.js" -not -name "*.test.js" -type f`.text();

// Get the absolute paths of all the js files in the dist directory
const getJsFilesAbsolutePaths = async (distDir: string) => {
	const files = await findJsFiles(distDir);

	return files
		.trim()
		.split("\n")
		.map((file) => file.replace(/\.js$/, ""))
		.filter(Boolean);
};

// Get the typescript extension from the file name
const getTsExtension = async (file: string) => {
	try {
		if (await Bun.file(`${file}.tsx`).exists()) return "tsx";
		if (await Bun.file(`${file}.ts`).exists()) return "ts";
		throw new Error(`No .ts or .tsx file found for ${file}`);
	} catch {
		throw new Error(`No .ts or .tsx file found for ${file}`);
	}
};
