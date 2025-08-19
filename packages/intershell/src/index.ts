/**
 * InterShell - Next Generation CLI Framework
 *
 * A comprehensive framework for building interactive command-line applications
 * with page-based navigation, state management, command parsing, plugin system,
 * and advanced entity management.
 *
 * @example
 * ```typescript
 * import { InterShellFramework, PageBuilder } from '@repo/intershell/interactive';
 * import { CommandParser, CommandRouter } from '@repo/intershell/command';
 * import { PluginManager } from '@repo/intershell/plugin';
 * import { EntityCommit, EntityBranch } from '@repo/intershell/entities';
 *
 * // Create interactive CLI
 * const framework = new InterShellFramework(initialState, pages, reducers);
 * await framework.run();
 *
 * // Parse and route commands
 * const parser = new CommandParser();
 * const router = new CommandRouter();
 * const parsed = parser.parse(['deploy', '--env', 'production']);
 * await router.route(parsed);
 *
 * // Manage plugins
 * const pluginManager = new PluginManager();
 * await pluginManager.load(myPlugin);
 *
 * // Analyze commits and branches
 * const commit = EntityCommit.parseByMessage('feat: add new feature');
 * const branchValidation = EntityBranch.validateBranchName('feature/new-feature');
 * ```
 */

// Re-export all modules for convenience
// export * from "./core";
// export * from "./entities";
// export * from "./interactive";
// export * from "./interactive/plugin";
