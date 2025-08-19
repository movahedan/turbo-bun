/**
 * InterShell Entities v2 - Enhanced entity management systems
 *
 * This package provides the next generation of entity management for the InterShell
 * framework, including enhanced commit management, branch validation, PR analysis,
 * and more.
 *
 * @example
 * ```typescript
 * import { EntityCommit, EntityBranch, EntityPR } from '@intershell/entities';
 *
 * // Parse commit messages
 * const commitData = EntityCommit.parseByMessage('feat: add new feature');
 *
 * // Validate branch names
 * const branchValidation = EntityBranch.validateBranchName('feature/new-feature');
 *
 * // Analyze pull requests
 * const prAnalysis = await EntityPR.analyzePR(123);
 * ```
 */

export * from "./affected";
export * from "./branch";
export * from "./changelog";
export * from "./commit";
export * from "./compose";
export * from "./packages";
export * from "./tag";
