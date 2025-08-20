/**
 * Plugin registry for the InterShell plugin system
 * Manages plugin registration, lookup, and organization
 */

import type { Plugin } from "./types";

export class PluginRegistry {
	private plugins: Map<string, Plugin> = new Map();
	private pluginsByCategory: Map<string, Set<string>> = new Map();
	private pluginsByKeyword: Map<string, Set<string>> = new Map();

	// Register a plugin
	register(plugin: Plugin): void {
		if (this.plugins.has(plugin.id)) {
			throw new Error(`Plugin with ID '${plugin.id}' is already registered`);
		}

		this.plugins.set(plugin.id, plugin);
		this.indexPlugin(plugin);
	}

	// Unregister a plugin
	unregister(pluginId: string): boolean {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) {
			return false;
		}

		this.plugins.delete(pluginId);
		this.unindexPlugin(plugin);
		return true;
	}

	// Get a plugin by ID
	get(pluginId: string): Plugin | undefined {
		return this.plugins.get(pluginId);
	}

	// Check if plugin exists
	has(pluginId: string): boolean {
		return this.plugins.has(pluginId);
	}

	// List all plugins
	list(): Plugin[] {
		return Array.from(this.plugins.values());
	}

	// List enabled plugins only
	listEnabled(): Plugin[] {
		return this.list().filter((plugin) => !plugin.config || plugin.config.enabled !== false);
	}

	// Get plugins by category
	getByCategory(category: string): Plugin[] {
		const pluginIds = this.pluginsByCategory.get(category);
		if (!pluginIds) {
			return [];
		}

		return Array.from(pluginIds)
			.map((id) => this.plugins.get(id))
			.filter((plugin): plugin is Plugin => plugin !== undefined);
	}

	// Get all categories
	getCategories(): string[] {
		return Array.from(this.pluginsByCategory.keys()).sort();
	}

	// Search plugins by query
	search(query: string): Plugin[] {
		const results = new Set<Plugin>();
		const lowerQuery = query.toLowerCase();

		// Search by ID
		for (const [id, plugin] of this.plugins) {
			if (id.toLowerCase().includes(lowerQuery)) {
				results.add(plugin);
			}
		}

		// Search by name
		for (const plugin of this.plugins.values()) {
			if (plugin.name.toLowerCase().includes(lowerQuery)) {
				results.add(plugin);
			}
		}

		// Search by description
		for (const plugin of this.plugins.values()) {
			if (plugin.description && plugin.description.toLowerCase().includes(lowerQuery)) {
				results.add(plugin);
			}
		}

		// Search by keywords
		const keywordIds = this.pluginsByKeyword.get(lowerQuery);
		if (keywordIds) {
			for (const id of keywordIds) {
				const plugin = this.plugins.get(id);
				if (plugin) {
					results.add(plugin);
				}
			}
		}

		// Search by category
		const categoryPlugins = this.getByCategory(lowerQuery);
		for (const plugin of categoryPlugins) {
			results.add(plugin);
		}

		// Search by author
		for (const plugin of this.plugins.values()) {
			if (plugin.author && plugin.author.toLowerCase().includes(lowerQuery)) {
				results.add(plugin);
			}
		}

		return Array.from(results);
	}

	// Get plugins with specific commands
	getPluginsWithCommand(commandName: string): Plugin[] {
		const results: Plugin[] = [];

		for (const plugin of this.plugins.values()) {
			if (plugin.commands) {
				const hasCommand = plugin.commands.some(
					(cmd) => cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName)),
				);

				if (hasCommand) {
					results.push(plugin);
				}
			}
		}

		return results;
	}

	// Get plugins with specific pages
	getPluginsWithPage(pageId: string): Plugin[] {
		const results: Plugin[] = [];

		for (const plugin of this.plugins.values()) {
			if (plugin.pages) {
				const hasPage = plugin.pages.some((page) => page.id === pageId);
				if (hasPage) {
					results.push(plugin);
				}
			}
		}

		return results;
	}

	// Get plugin dependencies
	getDependents(pluginId: string): Plugin[] {
		const dependents: Plugin[] = [];

		for (const plugin of this.plugins.values()) {
			if (plugin.dependencies && plugin.dependencies.includes(pluginId)) {
				dependents.push(plugin);
			}
			if (plugin.peerDependencies && plugin.peerDependencies.includes(pluginId)) {
				dependents.push(plugin);
			}
		}

		return dependents;
	}

	// Get plugins that conflict with given plugin
	getConflictingPlugins(pluginId: string): Plugin[] {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) {
			return [];
		}

		const conflicting: Plugin[] = [];

		// Check explicit conflicts
		if (plugin.conflicts) {
			for (const conflictId of plugin.conflicts) {
				const conflictPlugin = this.plugins.get(conflictId);
				if (conflictPlugin) {
					conflicting.push(conflictPlugin);
				}
			}
		}

		// Check plugins that conflict with this one
		for (const otherPlugin of this.plugins.values()) {
			if (otherPlugin.id === pluginId) continue;

			if (otherPlugin.conflicts && otherPlugin.conflicts.includes(pluginId)) {
				conflicting.push(otherPlugin);
			}
		}

		return conflicting;
	}

	// Get plugin statistics
	getStats(): {
		total: number;
		enabled: number;
		disabled: number;
		categories: Record<string, number>;
		topAuthors: Array<{ author: string; count: number }>;
	} {
		const plugins = this.list();
		const enabled = this.listEnabled();

		// Category stats
		const categories: Record<string, number> = {};
		for (const [category, pluginIds] of this.pluginsByCategory) {
			categories[category] = pluginIds.size;
		}

		// Author stats
		const authorCounts = new Map<string, number>();
		for (const plugin of plugins) {
			if (plugin.author) {
				authorCounts.set(plugin.author, (authorCounts.get(plugin.author) || 0) + 1);
			}
		}

		const topAuthors = Array.from(authorCounts.entries())
			.map(([author, count]) => ({ author, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		return {
			total: plugins.length,
			enabled: enabled.length,
			disabled: plugins.length - enabled.length,
			categories,
			topAuthors,
		};
	}

	// Clear all plugins
	clear(): void {
		this.plugins.clear();
		this.pluginsByCategory.clear();
		this.pluginsByKeyword.clear();
	}

	// Export registry data
	export(): {
		plugins: Plugin[];
		categories: string[];
		stats: ReturnType<typeof this.getStats>;
	} {
		return {
			plugins: this.list(),
			categories: this.getCategories(),
			stats: this.getStats(),
		};
	}

	// Private methods for indexing
	private indexPlugin(plugin: Plugin): void {
		// Index by category
		const category = plugin.metadata?.category || "General";
		if (!this.pluginsByCategory.has(category)) {
			this.pluginsByCategory.set(category, new Set());
		}
		this.pluginsByCategory.get(category)!.add(plugin.id);

		// Index by keywords
		if (plugin.metadata?.keywords) {
			for (const keyword of plugin.metadata.keywords) {
				const lowerKeyword = keyword.toLowerCase();
				if (!this.pluginsByKeyword.has(lowerKeyword)) {
					this.pluginsByKeyword.set(lowerKeyword, new Set());
				}
				this.pluginsByKeyword.get(lowerKeyword)!.add(plugin.id);
			}
		}

		// Index by tags
		if (plugin.metadata?.tags) {
			for (const tag of plugin.metadata.tags) {
				const lowerTag = tag.toLowerCase();
				if (!this.pluginsByKeyword.has(lowerTag)) {
					this.pluginsByKeyword.set(lowerTag, new Set());
				}
				this.pluginsByKeyword.get(lowerTag)!.add(plugin.id);
			}
		}
	}

	private unindexPlugin(plugin: Plugin): void {
		// Remove from category index
		const category = plugin.metadata?.category || "General";
		const categorySet = this.pluginsByCategory.get(category);
		if (categorySet) {
			categorySet.delete(plugin.id);
			if (categorySet.size === 0) {
				this.pluginsByCategory.delete(category);
			}
		}

		// Remove from keyword index
		if (plugin.metadata?.keywords) {
			for (const keyword of plugin.metadata.keywords) {
				const lowerKeyword = keyword.toLowerCase();
				const keywordSet = this.pluginsByKeyword.get(lowerKeyword);
				if (keywordSet) {
					keywordSet.delete(plugin.id);
					if (keywordSet.size === 0) {
						this.pluginsByKeyword.delete(lowerKeyword);
					}
				}
			}
		}

		// Remove from tag index
		if (plugin.metadata?.tags) {
			for (const tag of plugin.metadata.tags) {
				const lowerTag = tag.toLowerCase();
				const tagSet = this.pluginsByKeyword.get(lowerTag);
				if (tagSet) {
					tagSet.delete(plugin.id);
					if (tagSet.size === 0) {
						this.pluginsByKeyword.delete(lowerTag);
					}
				}
			}
		}
	}
}

export default PluginRegistry;
