/**
 * Plugin manager for the InterShell plugin system
 * Handles plugin lifecycle, dependencies, and conflict resolution
 */

import { PluginLoader } from "./loader";
import { PluginRegistry } from "./registry";
import type {
	ConflictReport,
	DependencyResolution,
	Plugin,
	PluginContext,
	PluginEvents,
	PluginHooks,
	PluginManagerOptions,
	ValidationResult,
} from "./types";

export class PluginManager {
	private registry: PluginRegistry;
	private loader: PluginLoader;
	private options: Required<PluginManagerOptions>;
	private hooks: PluginHooks = {};
	private eventHandlers: Map<keyof PluginEvents, Set<Function>> = new Map();
	private loadedPlugins: Map<string, PluginContext> = new Map();

	constructor(options: PluginManagerOptions = {}) {
		this.options = {
			pluginDir: options.pluginDir ?? "./plugins",
			configDir: options.configDir ?? "./config/plugins",
			autoLoad: options.autoLoad ?? true,
			enableHotReload: options.enableHotReload ?? false,
			sandboxMode: options.sandboxMode ?? false,
			maxPlugins: options.maxPlugins ?? 100,
			timeout: options.timeout ?? 30000,
		};

		this.registry = new PluginRegistry();
		this.loader = new PluginLoader({
			sandboxMode: this.options.sandboxMode,
			timeout: this.options.timeout,
		});

		if (this.options.autoLoad) {
			this.autoLoadPlugins();
		}
	}

	// Plugin lifecycle methods
	async load(plugin: Plugin): Promise<void> {
		try {
			// Validate plugin
			const validation = this.validatePlugin(plugin);
			if (!validation.isValid) {
				throw new Error(`Plugin validation failed: ${validation.errors[0]?.message}`);
			}

			// Check for conflicts
			const conflicts = await this.checkConflicts(plugin);
			if (conflicts.hasConflicts) {
				const errorConflicts = conflicts.conflicts.filter((c) => c.severity === "error");
				if (errorConflicts.length > 0) {
					throw new Error(`Plugin conflicts detected: ${errorConflicts[0].message}`);
				}
			}

			// Resolve dependencies
			const resolution = await this.resolveDependencies(plugin);
			if (resolution.missing.length > 0) {
				throw new Error(`Missing dependencies: ${resolution.missing.join(", ")}`);
			}

			// Run before load hook
			if (this.hooks.beforeLoad) {
				await this.hooks.beforeLoad(plugin);
			}

			// Create plugin context
			const context: PluginContext = {
				plugin,
				manager: this,
				registry: this.registry,
				loader: this.loader,
				config: plugin.config || { enabled: true },
				logger: this.createLogger(plugin.id),
			};

			// Register plugin
			this.registry.register(plugin);
			this.loadedPlugins.set(plugin.id, context);

			// Call plugin's onLoad hook
			if (plugin.onLoad) {
				await plugin.onLoad();
			}

			// Run after load hook
			if (this.hooks.afterLoad) {
				await this.hooks.afterLoad(plugin);
			}

			// Emit loaded event
			this.emit("loaded", { plugin });

			context.logger.info(`Plugin ${plugin.name} v${plugin.version} loaded successfully`);
		} catch (error) {
			this.emit("error", { pluginId: plugin.id, error: error as Error });
			throw error;
		}
	}

	async unload(pluginId: string): Promise<void> {
		try {
			const context = this.loadedPlugins.get(pluginId);
			if (!context) {
				throw new Error(`Plugin not loaded: ${pluginId}`);
			}

			// Run before unload hook
			if (this.hooks.beforeUnload) {
				await this.hooks.beforeUnload(pluginId);
			}

			// Call plugin's onUnload hook
			if (context.plugin.onUnload) {
				await context.plugin.onUnload();
			}

			// Unregister plugin
			this.registry.unregister(pluginId);
			this.loadedPlugins.delete(pluginId);

			// Run after unload hook
			if (this.hooks.afterUnload) {
				await this.hooks.afterUnload(pluginId);
			}

			// Emit unloaded event
			this.emit("unloaded", { pluginId });

			context.logger.info(`Plugin ${context.plugin.name} unloaded successfully`);
		} catch (error) {
			this.emit("error", { pluginId, error: error as Error });
			throw error;
		}
	}

	async reload(pluginId: string): Promise<void> {
		const context = this.loadedPlugins.get(pluginId);
		if (!context) {
			throw new Error(`Plugin not loaded: ${pluginId}`);
		}

		const plugin = context.plugin;
		await this.unload(pluginId);
		await this.load(plugin);
	}

	async enable(pluginId: string): Promise<void> {
		const context = this.loadedPlugins.get(pluginId);
		if (!context) {
			throw new Error(`Plugin not loaded: ${pluginId}`);
		}

		if (context.config.enabled) {
			return; // Already enabled
		}

		context.config.enabled = true;

		if (context.plugin.onEnable) {
			await context.plugin.onEnable();
		}

		this.emit("enabled", { plugin: context.plugin });
		context.logger.info(`Plugin ${context.plugin.name} enabled`);
	}

	async disable(pluginId: string): Promise<void> {
		const context = this.loadedPlugins.get(pluginId);
		if (!context) {
			throw new Error(`Plugin not loaded: ${pluginId}`);
		}

		if (!context.config.enabled) {
			return; // Already disabled
		}

		context.config.enabled = false;

		if (context.plugin.onDisable) {
			await context.plugin.onDisable();
		}

		this.emit("disabled", { pluginId });
		context.logger.info(`Plugin ${context.plugin.name} disabled`);
	}

	// Plugin discovery
	async discover(path: string): Promise<Plugin[]> {
		const pluginPaths = await this.loader.discover(path);
		const plugins: Plugin[] = [];

		for (const pluginPath of pluginPaths) {
			try {
				const plugin = await this.loader.load(pluginPath);
				plugins.push(plugin);
			} catch (error) {
				console.warn(`Failed to load plugin from ${pluginPath}:`, error);
			}
		}

		return plugins;
	}

	async scanDirectory(dir: string): Promise<Plugin[]> {
		return this.discover(dir);
	}

	// Plugin registry access
	getPlugin(pluginId: string): Plugin | undefined {
		return this.registry.get(pluginId);
	}

	listPlugins(): Plugin[] {
		return this.registry.list();
	}

	getLoadedPlugins(): Plugin[] {
		return Array.from(this.loadedPlugins.values()).map((ctx) => ctx.plugin);
	}

	getEnabledPlugins(): Plugin[] {
		return Array.from(this.loadedPlugins.values())
			.filter((ctx) => ctx.config.enabled)
			.map((ctx) => ctx.plugin);
	}

	getPluginMetadata(pluginId: string): any {
		const context = this.loadedPlugins.get(pluginId);
		return context?.plugin.metadata;
	}

	// Dependency management
	async resolveDependencies(plugin: Plugin): Promise<DependencyResolution> {
		const resolved: string[] = [];
		const missing: string[] = [];
		const conflicts: any[] = [];
		const loadOrder: string[] = [];

		if (plugin.dependencies) {
			for (const dep of plugin.dependencies) {
				if (this.registry.get(dep)) {
					resolved.push(dep);
					loadOrder.push(dep);
				} else {
					missing.push(dep);
				}
			}
		}

		// Check peer dependencies
		if (plugin.peerDependencies) {
			for (const peerDep of plugin.peerDependencies) {
				if (!this.registry.get(peerDep)) {
					missing.push(peerDep);
				}
			}
		}

		loadOrder.push(plugin.id);

		return { resolved, missing, conflicts, loadOrder };
	}

	async checkConflicts(plugin: Plugin): Promise<ConflictReport> {
		const conflicts: any[] = [];
		const warnings: string[] = [];

		// Check command conflicts
		if (plugin.commands) {
			for (const command of plugin.commands) {
				for (const existingPlugin of this.registry.list()) {
					if (existingPlugin.id === plugin.id) continue;

					if (existingPlugin.commands) {
						const conflictingCommand = existingPlugin.commands.find(
							(cmd) => cmd.name === command.name,
						);

						if (conflictingCommand) {
							conflicts.push({
								type: "command",
								pluginA: plugin.id,
								pluginB: existingPlugin.id,
								resource: command.name,
								severity: "error",
								message: `Command '${command.name}' is already defined by plugin '${existingPlugin.id}'`,
							});
						}
					}
				}
			}
		}

		// Check explicit conflicts
		if (plugin.conflicts) {
			for (const conflictId of plugin.conflicts) {
				if (this.registry.get(conflictId)) {
					conflicts.push({
						type: "dependency",
						pluginA: plugin.id,
						pluginB: conflictId,
						resource: conflictId,
						severity: "error",
						message: `Plugin '${plugin.id}' conflicts with '${conflictId}'`,
					});
				}
			}
		}

		return {
			hasConflicts: conflicts.length > 0,
			conflicts,
			warnings,
		};
	}

	// Plugin validation
	validatePlugin(plugin: Plugin): ValidationResult {
		const errors: any[] = [];
		const warnings: any[] = [];

		// Required fields
		if (!plugin.id) {
			errors.push({
				code: "MISSING_ID",
				message: "Plugin ID is required",
				field: "id",
				severity: "error",
			});
		}
		if (!plugin.name) {
			errors.push({
				code: "MISSING_NAME",
				message: "Plugin name is required",
				field: "name",
				severity: "error",
			});
		}
		if (!plugin.version) {
			errors.push({
				code: "MISSING_VERSION",
				message: "Plugin version is required",
				field: "version",
				severity: "error",
			});
		}

		// ID format validation
		if (plugin.id && !/^[a-z0-9-_]+$/.test(plugin.id)) {
			errors.push({
				code: "INVALID_ID_FORMAT",
				message: "Plugin ID must contain only lowercase letters, numbers, hyphens, and underscores",
				field: "id",
				severity: "error",
			});
		}

		// Version format validation
		if (plugin.version && !/^\d+\.\d+\.\d+/.test(plugin.version)) {
			warnings.push({
				code: "INVALID_VERSION_FORMAT",
				message: "Plugin version should follow semantic versioning (x.y.z)",
				field: "version",
				severity: "warning",
			});
		}

		// Check for duplicate IDs
		if (this.registry.get(plugin.id)) {
			errors.push({
				code: "DUPLICATE_ID",
				message: `Plugin with ID '${plugin.id}' is already registered`,
				field: "id",
				severity: "error",
			});
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
		};
	}

	// Event system
	on<K extends keyof PluginEvents>(event: K, handler: (data: PluginEvents[K]) => void): void {
		if (!this.eventHandlers.has(event)) {
			this.eventHandlers.set(event, new Set());
		}
		this.eventHandlers.get(event)!.add(handler);
	}

	off<K extends keyof PluginEvents>(event: K, handler: (data: PluginEvents[K]) => void): void {
		const handlers = this.eventHandlers.get(event);
		if (handlers) {
			handlers.delete(handler);
		}
	}

	emit<K extends keyof PluginEvents>(event: K, data: PluginEvents[K]): void {
		const handlers = this.eventHandlers.get(event);
		if (handlers) {
			for (const handler of handlers) {
				try {
					handler(data);
				} catch (error) {
					console.error(`Error in plugin event handler for ${event}:`, error);
				}
			}
		}
	}

	// Configuration management
	getPluginConfig(pluginId: string): any {
		const context = this.loadedPlugins.get(pluginId);
		return context?.config;
	}

	setPluginConfig(pluginId: string, config: any): void {
		const context = this.loadedPlugins.get(pluginId);
		if (context) {
			context.config = { ...context.config, ...config };
			this.emit("configChanged", { pluginId, config: context.config });
		}
	}

	// Hooks system
	setHooks(hooks: PluginHooks): void {
		this.hooks = { ...this.hooks, ...hooks };
	}

	// Private methods
	private async autoLoadPlugins(): Promise<void> {
		try {
			const plugins = await this.discover(this.options.pluginDir);
			for (const plugin of plugins) {
				try {
					await this.load(plugin);
				} catch (error) {
					console.warn(`Failed to auto-load plugin ${plugin.id}:`, error);
				}
			}
		} catch (error) {
			console.warn("Failed to auto-load plugins:", error);
		}
	}

	private createLogger(pluginId: string): any {
		return {
			debug: (message: string, ...args: any[]) => console.debug(`[${pluginId}]`, message, ...args),
			info: (message: string, ...args: any[]) => console.info(`[${pluginId}]`, message, ...args),
			warn: (message: string, ...args: any[]) => console.warn(`[${pluginId}]`, message, ...args),
			error: (message: string, ...args: any[]) => console.error(`[${pluginId}]`, message, ...args),
		};
	}
}

export default PluginManager;
