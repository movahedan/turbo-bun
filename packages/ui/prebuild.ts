#!/usr/bin/env bun
import {
	existsSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

interface PackageJson {
	name: string;
	version: string;
	exports?: Record<string, ExportCondition>;
	[key: string]: unknown;
}

interface ExportCondition {
	import?: {
		types: string;
		default: string;
	};
	require?: {
		types: string;
		default: string;
	};
}

/**
 * Automatically generates package.json exports based on src/ directory structure
 * Scans for component directories and creates exports for each one
 */
function generateExports(): void {
	// If no package path provided, use the current working directory
	const targetPackage = process.cwd();
	const srcDir = join(targetPackage, "src");
	const packageJsonPath = join(targetPackage, "package.json");

	// Check if package.json exists
	if (!existsSync(packageJsonPath)) {
		console.error(`❌ package.json not found at ${packageJsonPath}`);
		process.exit(1);
	}

	// Check if src directory exists
	if (!existsSync(srcDir)) {
		console.error(`❌ src directory not found at ${srcDir}`);
		process.exit(1);
	}

	try {
		// Read current package.json
		const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
		const packageJson: PackageJson = JSON.parse(packageJsonContent);

		// Scan src directory for component folders
		const componentDirs = readdirSync(srcDir)
			.filter((item) => {
				const itemPath = join(srcDir, item);
				return statSync(itemPath).isDirectory();
			})
			.filter((dir) => {
				// Check if directory has an index file
				const indexFiles = ["index.ts", "index.tsx", "index.js", "index.jsx"];
				return indexFiles.some((file) => existsSync(join(srcDir, dir, file)));
			});
		const componentFiles = readdirSync(srcDir)
			.filter((item) => {
				const itemPath = join(srcDir, item);
				return statSync(itemPath).isFile();
			})
			.filter((file) => {
				const isTestFile =
					file.endsWith(".test.ts") || file.endsWith(".test.tsx");
				const isTsFile = file.endsWith(".ts") || file.endsWith(".tsx");

				return !isTestFile && isTsFile;
			});

		// Generate exports for each component
		const newExports: Record<string, ExportCondition> = {};

		for (const componentName of componentDirs) {
			newExports[`./${componentName}`] = {
				import: {
					types: `./dist/${componentName}/${componentName}.d.mts`,
					default: `./dist/${componentName}/${componentName}.mjs`,
				},
				require: {
					types: `./dist/${componentName}/${componentName}.d.ts`,
					default: `./dist/${componentName}/${componentName}.js`,
				},
			};
		}
		for (const componentFile of componentFiles) {
			const componentName = componentFile
				.replace(".ts", "")
				.replace(".tsx", "");
			newExports[`./${componentName}`] = {
				import: {
					types: `./dist/${componentFile}.d.mts`,
					default: `./dist/${componentFile}.mjs`,
				},
				require: {
					types: `./dist/${componentFile}.d.ts`,
					default: `./dist/${componentFile}.js`,
				},
			};
		}

		// Remove existing exports and create new package.json with exports at the end
		// biome-ignore lint/correctness/noUnusedVariables: Its removing the exports key
		const { exports, ...packageWithoutExports } = packageJson;
		const newPackageJson = {
			...packageWithoutExports,
			exports: newExports,
		};

		// Write back to package.json
		writeFileSync(
			packageJsonPath,
			`${JSON.stringify(newPackageJson, null, "\t")}\n`,
		);

		console.log(
			`✅ Generated exports for ${Object.keys(newExports).length} components in ${packageJson.name}:`,
		);
		for (const name of Object.keys(newExports)) {
			console.log(`   - ${name}`);
		}
	} catch (error) {
		console.error(
			"❌ Error generating exports:",
			error instanceof Error ? error.message : String(error),
		);
		process.exit(1);
	}
}

generateExports();
