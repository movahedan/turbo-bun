/**
 * Type definitions for the InterShell plugin system
 */

import type { CommandDefinition } from "../../command/types";
import type { Page } from "../pages";

// Core plugin interface
export interface Plugin {
	// Basic metadata
	id: string;
	name: string;
	version: string;
	description?: string;
	author?: string;
	license?: string;
	homepage?: string;
	repository?: string;

	// Plugin lifecycle hooks
	onLoad?(): Promise<void> | void;
	onUnload?(): Promise<void> | void;
	onEnable?(): Promise<void> | void;
	onDisable?(): Promise<void> | void;

	// Plugin exports
	commands?: CommandDefinition[];
	pages?: PageDefinition[];
	utilities?: Record<string, any>;
	middleware?: PluginMiddleware[];

	// Dependencies
	dependencies?: string[];
	peerDependencies?: string[];
	conflicts?: string[];

	// Plugin configuration
	config?: PluginConfig;
	schema?: PluginConfigSchema;

	// Plugin metadata
	metadata?: PluginMetadata;
}

// Plugin metadata
export interface PluginMetadata {
	tags?: string[];
	category?: string;
	keywords?: string[];
	compatibility?: {
		intershell?: string;
		node?: string;
		os?: string[];
	};
	experimental?: boolean;
	deprecated?: boolean;
	replacedBy?: string;
}

// Plugin configuration
export interface PluginConfig {
	enabled?: boolean;
	settings?: Record<string, any>;
	environment?: Record<string, string>;
}

export interface PluginConfigSchema {
	type: "object";
	properties: Record<string, ConfigProperty>;
	required?: string[];
}

export interface ConfigProperty {
	type: "string" | "number" | "boolean" | "array" | "object";
	description?: string;
	default?: any;
	enum?: any[];
	items?: ConfigProperty;
	properties?: Record<string, ConfigProperty>;
}

// Page definition for plugins
export interface PageDefinition {
	id: string;
	title: string;
	description?: string;
	category?: string;
	factory: () => Page<any, any>;
}

// Plugin middleware
export interface PluginMiddleware {
	name: string;
	priority?: number;
	handler: MiddlewareHandler;
}

export type MiddlewareHandler = (
	context: MiddlewareContext,
	next: () => Promise<void>,
) => Promise<void>;

export interface MiddlewareContext {
	plugin: Plugin;
	command?: CommandDefinition;
	args?: any;
	data?: Record<string, any>;
}

// Plugin manager options
export interface PluginManagerOptions {
	pluginDir?: string;
	configDir?: string;
	autoLoad?: boolean;
	enableHotReload?: boolean;
	sandboxMode?: boolean;
	maxPlugins?: number;
	timeout?: number;
}

// Plugin loading and discovery
export interface PluginLoader {
	load(path: string): Promise<Plugin>;
	unload(pluginId: string): Promise<void>;
	reload(pluginId: string): Promise<void>;
	discover(directory: string): Promise<string[]>;
}

// Plugin registry
export interface PluginRegistry {
	register(plugin: Plugin): void;
	unregister(pluginId: string): boolean;
	get(pluginId: string): Plugin | undefined;
	list(): Plugin[];
	search(query: string): Plugin[];
	getByCategory(category: string): Plugin[];
}

// Dependency resolution
export interface DependencyResolution {
	resolved: string[];
	missing: string[];
	conflicts: DependencyConflict[];
	loadOrder: string[];
}

export interface DependencyConflict {
	pluginId: string;
	conflictWith: string;
	reason: string;
}

// Conflict detection
export interface ConflictReport {
	hasConflicts: boolean;
	conflicts: PluginConflict[];
	warnings: string[];
}

export interface PluginConflict {
	type: "command" | "page" | "dependency" | "version";
	pluginA: string;
	pluginB: string;
	resource: string;
	severity: "error" | "warning";
	message: string;
}

// Plugin events
export interface PluginEvents {
	loaded: { plugin: Plugin };
	unloaded: { pluginId: string };
	enabled: { plugin: Plugin };
	disabled: { pluginId: string };
	error: { pluginId: string; error: Error };
	configChanged: { pluginId: string; config: PluginConfig };
}

// Plugin context
export interface PluginContext {
	plugin: Plugin;
	manager: any; // PluginManager
	registry: PluginRegistry;
	loader: PluginLoader;
	config: PluginConfig;
	logger: PluginLogger;
}

// Plugin logger
export interface PluginLogger {
	debug(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
	error(message: string, ...args: any[]): void;
}

// Plugin installation
export interface PluginPackage {
	name: string;
	version: string;
	description?: string;
	main: string;
	plugin: Plugin;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

export interface InstallOptions {
	force?: boolean;
	skipDependencies?: boolean;
	registry?: string;
	timeout?: number;
}

// Plugin validation
export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: ValidationWarning[];
}

export interface ValidationError {
	code: string;
	message: string;
	field?: string;
	severity: "error" | "warning";
}

export interface ValidationWarning extends ValidationError {
	severity: "warning";
}

// Plugin hooks
export interface PluginHooks {
	beforeLoad?: (plugin: Plugin) => Promise<void> | void;
	afterLoad?: (plugin: Plugin) => Promise<void> | void;
	beforeUnload?: (pluginId: string) => Promise<void> | void;
	afterUnload?: (pluginId: string) => Promise<void> | void;
	onError?: (pluginId: string, error: Error) => Promise<void> | void;
}

// Plugin API
export interface PluginAPI {
	// Core framework access
	getFramework(): any;
	getCommandRouter(): any;
	getPluginManager(): any;

	// Utility functions
	createLogger(pluginId: string): PluginLogger;
	getConfig(pluginId: string): PluginConfig;
	setConfig(pluginId: string, config: Partial<PluginConfig>): void;

	// Event system
	on(event: string, handler: Function): void;
	off(event: string, handler: Function): void;
	emit(event: string, data: any): void;
}

// Error types
export class PluginError extends Error {
	constructor(
		message: string,
		public pluginId: string,
		public code: string,
	) {
		super(message);
		this.name = "PluginError";
	}
}

export class PluginLoadError extends PluginError {
	constructor(message: string, pluginId: string) {
		super(message, pluginId, "LOAD_ERROR");
		this.name = "PluginLoadError";
	}
}

export class PluginConflictError extends PluginError {
	constructor(
		message: string,
		pluginId: string,
		public conflicts: PluginConflict[],
	) {
		super(message, pluginId, "CONFLICT_ERROR");
		this.name = "PluginConflictError";
	}
}

export class PluginValidationError extends PluginError {
	constructor(
		message: string,
		pluginId: string,
		public validationErrors: ValidationError[],
	) {
		super(message, pluginId, "VALIDATION_ERROR");
		this.name = "PluginValidationError";
	}
}
