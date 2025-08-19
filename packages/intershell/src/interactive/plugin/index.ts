/**
 * InterShell Plugin System - Extensible plugin architecture
 *
 * This package provides a complete plugin system for extending the InterShell
 * framework with custom commands, pages, and functionality.
 *
 * @example
 * ```typescript
 * import { PluginManager, Plugin } from '@intershell/plugin';
 *
 * const pluginManager = new PluginManager();
 *
 * const myPlugin: Plugin = {
 *   id: 'my-plugin',
 *   name: 'My Plugin',
 *   version: '1.0.0',
 *   description: 'A sample plugin',
 *   onLoad: async () => {
 *     console.log('Plugin loaded');
 *   },
 *   commands: [
 *     {
 *       name: 'hello',
 *       description: 'Say hello',
 *       handler: async () => console.log('Hello from plugin!')
 *     }
 *   ]
 * };
 *
 * await pluginManager.load(myPlugin);
 * ```
 */

export * from "./loader";
export * from "./manager";
export * from "./registry";
export * from "./types";

// Version information
export const VERSION = "0.1.0";
export const PACKAGE_NAME = "@intershell/plugin";

// Plugin system metadata
export const PLUGIN_INFO = {
	name: "InterShell Plugin System",
	version: VERSION,
	description: "Extensible plugin architecture for commands and functionality",
	author: "Monobun",
	license: "MIT",
} as const;
