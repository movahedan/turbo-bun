#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

interface DevcontainerConfig {
	customizations?: {
		vscode?: {
			extensions?: string[];
			settings?: Record<string, unknown>;
		};
	};
}

interface ExtensionsConfig {
	recommendations: string[];
}

// Strip comments from JSON content
function stripComments(content: string): string {
	return content
		.replace(/\/\/.*$/gm, "") // Remove single-line comments
		.replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
		.replace(/^\s*[\r\n]/gm, ""); // Remove empty lines
}

// Read and parse devcontainer.json
function readDevcontainerConfig(): DevcontainerConfig {
	const devcontainerPath = join(
		import.meta.dir,
		"..",
		".devcontainer",
		"devcontainer.json",
	);
	const content = readFileSync(devcontainerPath, "utf8");
	const cleanContent = stripComments(content);
	return JSON.parse(cleanContent);
}

// Extract extensions from devcontainer config
function extractExtensions(devcontainerConfig: DevcontainerConfig): string[] {
	const extensions =
		devcontainerConfig.customizations?.vscode?.extensions || [];
	return extensions;
}

// Extract settings from devcontainer config
function extractSettings(
	devcontainerConfig: DevcontainerConfig,
): Record<string, unknown> {
	const settings = devcontainerConfig.customizations?.vscode?.settings || {};
	return settings;
}

// Write extensions.json
function writeExtensionsJson(extensions: string[]): void {
	const extensionsPath = join(
		import.meta.dir,
		"..",
		".vscode",
		"extensions.json",
	);
	const extensionsConfig: ExtensionsConfig = {
		recommendations: extensions,
	};

	// Ensure .vscode directory exists
	const vscodeDir = dirname(extensionsPath);
	if (!existsSync(vscodeDir)) {
		mkdirSync(vscodeDir, { recursive: true });
	}

	writeFileSync(extensionsPath, JSON.stringify(extensionsConfig, null, 2));
	console.log(
		`✅ Updated ${extensionsPath} with ${extensions.length} extensions`,
	);
}

// Write settings.json
function writeSettingsJson(settings: Record<string, unknown>): void {
	const settingsPath = join(import.meta.dir, "..", ".vscode", "settings.json");

	// Ensure .vscode directory exists
	const vscodeDir = dirname(settingsPath);
	if (!existsSync(vscodeDir)) {
		mkdirSync(vscodeDir, { recursive: true });
	}

	writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
	console.log(`✅ Updated ${settingsPath}`);
}

// Main function
function main(): void {
	try {
		console.log("🔄 Syncing VS Code configuration from devcontainer.json...");

		const devcontainerConfig = readDevcontainerConfig();
		const extensions = extractExtensions(devcontainerConfig);
		const settings = extractSettings(devcontainerConfig);

		writeExtensionsJson(extensions);
		writeSettingsJson(settings);

		console.log("✅ VS Code configuration synced successfully!");
		console.log(`📦 Extensions: ${extensions.length}`);
		console.log(`⚙️  Settings: ${Object.keys(settings).length} settings`);
	} catch (error) {
		console.error(
			"❌ Error syncing VS Code configuration:",
			error instanceof Error ? error.message : String(error),
		);
		process.exit(1);
	}
}

// Run if called directly
if (import.meta.main) {
	main();
}

export { main, extractExtensions, extractSettings };
