#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";

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

/**
 * VS Code configuration synchronization script
 * Syncs extensions and settings from devcontainer.json to .vscode/
 */
export const syncVscodeConfigScript = createScript(
	{
		name: "VS Code Configuration Sync",
		description:
			"Synchronize VS Code extensions and settings from devcontainer.json to .vscode/ directory",
		usage: "bun run sync:vscode [options]",
		examples: [
			"bun run sync:vscode",
			"bun run sync:vscode --dry-run",
			"bun run sync:vscode --extensions-only",
			"bun run sync:vscode --settings-only",
		],
		options: [
			{
				short: "-d",
				long: "--dry-run",
				description: "Show what would be synced without writing files",
				required: false,
				validator: validators.boolean,
			},
			{
				short: "-e",
				long: "--extensions-only",
				description: "Only sync extensions, skip settings",
				required: false,
				validator: validators.boolean,
			},
			{
				short: "-s",
				long: "--settings-only",
				description: "Only sync settings, skip extensions",
				required: false,
				validator: validators.boolean,
			},
			{
				short: "-v",
				long: "--verbose",
				description: "Show detailed sync information",
				required: false,
				validator: validators.boolean,
			},
		],
	} as const,
	async (args: {
		"dry-run"?: boolean;
		"extensions-only"?: boolean;
		"settings-only"?: boolean;
		verbose?: boolean;
	}): Promise<void> => {
		console.log("🔄 Syncing VS Code configuration from devcontainer.json...");

		const devcontainerConfig = readDevcontainerConfig();
		const extensions = extractExtensions(devcontainerConfig);
		const settings = extractSettings(devcontainerConfig);

		if (args["dry-run"]) {
			console.log("🔍 Dry run mode - showing what would be synced:");
			if (!args["settings-only"]) {
				console.log(`📦 Extensions (${extensions.length}):`);
				extensions.forEach((ext) => console.log(`  - ${ext}`));
			}
			if (!args["extensions-only"]) {
				console.log(`⚙️  Settings (${Object.keys(settings).length}):`);
				Object.entries(settings).forEach(([key, value]) =>
					console.log(`  - ${key}: ${JSON.stringify(value)}`),
				);
			}
			return;
		}

		// Sync extensions (unless settings-only mode)
		if (!args["settings-only"]) {
			writeExtensionsJson(extensions);
		}

		// Sync settings (unless extensions-only mode)
		if (!args["extensions-only"]) {
			writeSettingsJson(settings);
		}

		console.log("✅ VS Code configuration synced successfully!");

		if (args.verbose) {
			console.log(`📦 Extensions: ${extensions.length}`);
			console.log(`⚙️  Settings: ${Object.keys(settings).length} settings`);
		}
	},
);

// Run if called directly
if (import.meta.main) {
	syncVscodeConfigScript();
}

/**
 * Strip comments from JSON content
 */
function stripComments(content: string): string {
	return content
		.replace(/\/\/[^\r\n]*/g, "")
		.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "")
		.replace(/^\s*[\r\n]/gm, "");
}

/**
 * Read and parse devcontainer.json
 */
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

/**
 * Extract extensions from devcontainer config
 */
function extractExtensions(devcontainerConfig: DevcontainerConfig): string[] {
	const extensions =
		devcontainerConfig.customizations?.vscode?.extensions || [];
	return extensions;
}

/**
 * Extract settings from devcontainer config
 */
function extractSettings(
	devcontainerConfig: DevcontainerConfig,
): Record<string, unknown> {
	const settings = devcontainerConfig.customizations?.vscode?.settings || {};
	return settings;
}

/**
 * Write extensions.json file
 */
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

/**
 * Write settings.json file
 */
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
