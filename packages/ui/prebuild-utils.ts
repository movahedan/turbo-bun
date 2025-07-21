#!/usr/bin/env bun
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface PackageJson {
	name: string;
	version: string;
	exports?: Record<string, ExportCondition>;
	[key: string]: unknown;
}

export interface ExportCondition {
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
export function prebuild(
	getNewExports: (
		srcDir: string,
		directories: string[],
	) => Record<string, ExportCondition>,
): void {
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

		const newExports = getNewExports(srcDir, readdirSync(srcDir));

		// Remove existing exports and create new package.json with exports at the end
		// biome-ignore lint/correctness/noUnusedVariables: Its removing the exports key
		const { exports, ...packageWithoutExports } = packageJson;
		const newPackageJson = {
			...packageWithoutExports,
			exports: getNewExports(srcDir, readdirSync(srcDir)),
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
