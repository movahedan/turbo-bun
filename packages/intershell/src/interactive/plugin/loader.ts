/**
 * Plugin loader for the InterShell plugin system
 * Handles loading, unloading, and discovery of plugins
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Plugin, PluginPackage } from "./types";

export interface PluginLoaderOptions {
	sandboxMode?: boolean;
	timeout?: number;
	allowedPaths?: string[];
	blockedPaths?: string[];
}

export class PluginLoader {
	private options: Required<PluginLoaderOptions>;
	private loadedModules: Map<string, any> = new Map();

	constructor(options: PluginLoaderOptions = {}) {
		this.options = {
			sandboxMode: options.sandboxMode ?? false,
			timeout: options.timeout ?? 30000,
			allowedPaths: options.allowedPaths ?? [],
			blockedPaths: options.blockedPaths ?? [],
		};
	}

	// Load a plugin from path
	async load(path: string): Promise<Plugin> {
		const resolvedPath = resolve(path);

		// Security checks
		if (this.options.sandboxMode) {
			this.validatePath(resolvedPath);
		}

		try {
			// Check if it's a directory with package.json
			if (statSync(resolvedPath).isDirectory()) {
				return this.loadFromDirectory(resolvedPath);
			}
			return this.loadFromFile(resolvedPath);
		} catch (error) {
			throw new Error(`Failed to load plugin from ${path}: ${error}`);
		}
	}

	// Unload a plugin
	async unload(pluginId: string): Promise<void> {
		const moduleInfo = this.loadedModules.get(pluginId);
		if (moduleInfo) {
			// Clear from require cache if possible
			if (moduleInfo.path && require.cache[moduleInfo.path]) {
				delete require.cache[moduleInfo.path];
			}
			this.loadedModules.delete(pluginId);
		}
	}

	// Reload a plugin
	async reload(pluginId: string): Promise<Plugin> {
		const moduleInfo = this.loadedModules.get(pluginId);
		if (!moduleInfo) {
			throw new Error(`Plugin ${pluginId} is not loaded`);
		}

		await this.unload(pluginId);
		return this.load(moduleInfo.originalPath);
	}

	// Discover plugins in a directory
	async discover(directory: string): Promise<string[]> {
		const pluginPaths: string[] = [];

		if (!existsSync(directory)) {
			return pluginPaths;
		}

		const entries = readdirSync(directory, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(directory, entry.name);

			if (entry.isDirectory()) {
				// Check if directory contains a plugin
				const packageJsonPath = join(fullPath, "package.json");
				const indexPath = join(fullPath, "index");
				const pluginPath = join(fullPath, "plugin");

				if (existsSync(packageJsonPath)) {
					try {
						const packageJson = await this.loadPackageJson(packageJsonPath);
						if (packageJson.plugin || packageJson.main) {
							pluginPaths.push(fullPath);
						}
					} catch (error) {
						// Skip invalid package.json files
						continue;
					}
				} else if (existsSync(indexPath)) {
					pluginPaths.push(indexPath);
				} else if (existsSync(pluginPath)) {
					pluginPaths.push(pluginPath);
				}

				// Recursively search subdirectories
				const subPaths = await this.discover(fullPath);
				pluginPaths.push(...subPaths);
			} else if (entry.isFile()) {
				// Check if file is a plugin
				if (entry.name.endsWith("") || entry.name.endsWith(".ts")) {
					// Basic heuristic - files named plugin.* or containing 'plugin' in the name
					if (
						entry.name.includes("plugin") ||
						entry.name === "index" ||
						entry.name === "index.ts"
					) {
						pluginPaths.push(fullPath);
					}
				}
			}
		}

		return pluginPaths;
	}

	// Load plugin from directory (with package.json)
	private async loadFromDirectory(directoryPath: string): Promise<Plugin> {
		const packageJsonPath = join(directoryPath, "package.json");

		if (!existsSync(packageJsonPath)) {
			throw new Error(`No package.json found in ${directoryPath}`);
		}

		const packageJson: PluginPackage = await this.loadPackageJson(packageJsonPath);

		// Determine main file
		let mainFile = packageJson.main || "index";
		if (!mainFile.startsWith("./")) {
			mainFile = "./" + mainFile;
		}

		const mainPath = resolve(directoryPath, mainFile);

		if (!existsSync(mainPath)) {
			throw new Error(`Main file not found: ${mainPath}`);
		}

		// Load the plugin module
		const pluginModule = await this.loadModule(mainPath);

		// Extract plugin definition
		let plugin: Plugin;

		if (packageJson.plugin) {
			// Plugin definition in package.json
			plugin = {
				...packageJson.plugin,
				...pluginModule.plugin,
			};
		} else if (pluginModule.plugin) {
			// Plugin definition in module
			plugin = pluginModule.plugin;
		} else if (pluginModule.default && typeof pluginModule.default === "object") {
			// Default export is the plugin
			plugin = pluginModule.default;
		} else {
			// Use the entire module as plugin
			plugin = pluginModule;
		}

		// Validate required fields
		if (!plugin.id) {
			plugin.id = packageJson.name || directoryPath.split("/").pop() || "unknown";
		}
		if (!plugin.name) {
			plugin.name = packageJson.name || plugin.id;
		}
		if (!plugin.version) {
			plugin.version = packageJson.version || "0.0.0";
		}
		if (!plugin.description) {
			plugin.description = packageJson.description;
		}

		// Store module info
		this.loadedModules.set(plugin.id, {
			path: mainPath,
			originalPath: directoryPath,
			module: pluginModule,
			packageJson,
		});

		return plugin;
	}

	// Load plugin from single file
	private async loadFromFile(filePath: string): Promise<Plugin> {
		const pluginModule = await this.loadModule(filePath);

		let plugin: Plugin;

		if (pluginModule.plugin) {
			plugin = pluginModule.plugin;
		} else if (pluginModule.default && typeof pluginModule.default === "object") {
			plugin = pluginModule.default;
		} else {
			plugin = pluginModule;
		}

		// Validate required fields
		if (!plugin.id) {
			plugin.id =
				filePath
					.split("/")
					.pop()
					?.replace(/\.[^/.]+$/, "") || "unknown";
		}
		if (!plugin.name) {
			plugin.name = plugin.id;
		}
		if (!plugin.version) {
			plugin.version = "0.0.0";
		}

		// Store module info
		this.loadedModules.set(plugin.id, {
			path: filePath,
			originalPath: filePath,
			module: pluginModule,
		});

		return plugin;
	}

	// Load a module with timeout and error handling
	private async loadModule(modulePath: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error(`Plugin load timeout: ${modulePath}`));
			}, this.options.timeout);

			try {
				// Clear from cache to ensure fresh load
				if (require.cache[modulePath]) {
					delete require.cache[modulePath];
				}

				const module = require(modulePath);
				clearTimeout(timeout);
				resolve(module);
			} catch (error) {
				clearTimeout(timeout);
				reject(error);
			}
		});
	}

	// Load and parse package.json
	private async loadPackageJson(packageJsonPath: string): Promise<PluginPackage> {
		try {
			const content = await import(packageJsonPath);
			return content.default || content;
		} catch (error) {
			throw new Error(`Failed to load package.json from ${packageJsonPath}: ${error}`);
		}
	}

	// Security validation for sandbox mode
	private validatePath(path: string): void {
		// Check blocked paths
		for (const blockedPath of this.options.blockedPaths) {
			if (path.startsWith(resolve(blockedPath))) {
				throw new Error(`Access to blocked path: ${path}`);
			}
		}

		// Check allowed paths (if specified)
		if (this.options.allowedPaths.length > 0) {
			const isAllowed = this.options.allowedPaths.some((allowedPath) =>
				path.startsWith(resolve(allowedPath)),
			);

			if (!isAllowed) {
				throw new Error(`Access to path not allowed: ${path}`);
			}
		}

		// Basic security checks
		if (path.includes("..")) {
			throw new Error(`Path traversal not allowed: ${path}`);
		}

		// Check for sensitive directories
		const sensitivePaths = ["/etc", "/usr", "/bin", "/sbin", "/root"];
		for (const sensitivePath of sensitivePaths) {
			if (path.startsWith(sensitivePath)) {
				throw new Error(`Access to sensitive path not allowed: ${path}`);
			}
		}
	}
}

export default PluginLoader;
