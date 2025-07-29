#!/usr/bin/env bun
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createScript } from "./utils/create-scripts";

const syncVscodeConfigScriptConfig = {
	name: "Local VS Code Configuration Sync",
	description:
		"Synchronize VS Code extensions and settings from devcontainer.json to .vscode/ directory",
	usage: "bun run local:vscode [options]",
	examples: [
		"bun run local:vscode",
		"bun run local:vscode --dry-run",
		"bun run local:vscode --extensions-only",
		"bun run local:vscode --settings-only",
	],
	options: [],
} as const;

export const syncVscodeConfigScript = createScript(
	syncVscodeConfigScriptConfig,
	async function main(args, xConsole) {
		xConsole.log("🔄 Syncing VS Code configuration from devcontainer.json...");

		const {
			customizations: {
				vscode: { extensions: recommendations = [], settings = {} } = {},
			} = {},
		} = JSON.parse(
			stripComments(
				await Bun.file(
					join(import.meta.dir, "..", ".devcontainer", "devcontainer.json"),
				).text(),
			),
		);
		const settingsConfigString = JSON.stringify(settings, null, 2);
		const extensionsConfigString = JSON.stringify({ recommendations }, null, 2);

		if (args["dry-run"]) {
			xConsole.log("🔍 Dry run mode - showing what would be synced:");
			xConsole.log(`📦 Extensions:\n${extensionsConfigString}`);
			xConsole.log(`⚙️  Settings:\n${settingsConfigString}`);

			return;
		}

		const vscodeDir = join(import.meta.dir, "..", ".vscode");
		if (!existsSync(vscodeDir)) mkdirSync(vscodeDir, { recursive: true });
		const extensionsPath = join(vscodeDir, "extensions.json");
		const settingsPath = join(vscodeDir, "settings.json");

		writeFileSync(extensionsPath, extensionsConfigString);
		xConsole.log(`✅ Updated ${extensionsPath}!`);
		writeFileSync(settingsPath, settingsConfigString);
		xConsole.log(`✅ Updated ${settingsPath}!`);
		xConsole.log("✅ VS Code configuration synced successfully!");
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
