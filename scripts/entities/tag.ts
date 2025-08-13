/** biome-ignore-all lint/complexity/noUselessConstructor: it's a simple util class */
import { $ } from "bun";

export interface TagInfo {
	date: string;
	message: string;
}

export interface TagOperation {
	tagName: string;
	message: string;
	force?: boolean;
	dryRun?: boolean;
}

export class EntityTag {
	constructor() {}

	private static readonly prefix = "v";

	static getPrefix(): string {
		return EntityTag.prefix;
	}

	static toTag(version: string, prefix = EntityTag.prefix): string {
		return `${prefix}${version}`;
	}

	static async getTagSha(tagName: string): Promise<string> {
		const result = await $`git rev-parse ${tagName}`.nothrow().quiet();
		if (result.exitCode === 0) {
			return result.text().trim();
		}
		throw new Error(`Tag ${tagName} not found`);
	}

	static async tagExists(tagName: string): Promise<boolean> {
		const result = await $`git tag --list ${tagName}`.nothrow().quiet();
		return result.exitCode === 0 && result.text().trim() === tagName;
	}

	static async getTagInfo(tagName: string): Promise<TagInfo> {
		const result =
			await $`git tag -l --format='%(creatordate:iso8601)%0a%(contents:subject)' ${tagName}`
				.nothrow()
				.quiet();

		if (result.exitCode === 0) {
			const lines = result.text?.().trim?.().split("\n").filter(Boolean) ?? [];
			if (lines.length >= 2) {
				return {
					date: lines[0],
					message: lines[1],
				};
			}
		}
		throw new Error(`Could not get info for tag ${tagName}`);
	}

	static async getFirstCommit(): Promise<string> {
		const result = await $`git rev-list --max-parents=0 HEAD`.nothrow().quiet();
		if (result.exitCode === 0) {
			return result.text().trim();
		}
		throw new Error("Could not find first commit");
	}

	static async getBaseTag(prefix = EntityTag.prefix): Promise<string | undefined> {
		const result = await $`git tag --sort=-version:refname --list "${prefix}*" | head -1`
			.nothrow()
			.quiet();

		if (result.exitCode === 0) {
			const tag = result.text().trim();
			return tag || undefined;
		}
		return undefined;
	}

	static async getBaseTagSha(from?: string): Promise<string> {
		if (from) {
			// Check if 'from' is a valid SHA or ref
			try {
				const result = await $`git rev-parse ${from}`.nothrow().quiet();
				if (result.exitCode === 0) {
					return result.text().trim();
				}
			} catch {
				// If not a valid SHA/ref, fall back to tag logic
			}
		}

		const tag = await EntityTag.getBaseTag();
		if (tag) {
			return await EntityTag.getTagSha(tag);
		}

		return await EntityTag.getFirstCommit();
	}

	// Enhanced tag operations with built-in validation and dry-run support
	static async listTags(): Promise<string[]> {
		const result = await $`git tag --list "${EntityTag.prefix}*" --sort=-version:refname`
			.nothrow()
			.quiet();

		if (result.exitCode !== 0) {
			return [];
		}

		return result.text().trim().split("\n").filter(Boolean);
	}

	static async createTag(operation: TagOperation): Promise<void> {
		const { tagName, message, force = false, dryRun = false } = operation;

		// Validate tag doesn't exist (unless force)
		if (!force && (await EntityTag.tagExists(tagName))) {
			throw new Error(`Tag ${tagName} already exists, use --force to override`);
		}

		if (dryRun) {
			return; // Just validate, don't execute
		}

		const forceFlag = force ? "-f" : "";
		try {
			await $`git tag ${forceFlag} -a ${tagName} -m "${message}"`;
		} catch (error) {
			throw new Error(
				`Failed to create tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async deleteTag(tagName: string, dryRun = false): Promise<void> {
		// Validate tag exists
		if (!(await EntityTag.tagExists(tagName))) {
			throw new Error(`Tag ${tagName} does not exist`);
		}

		if (dryRun) {
			return; // Just validate, don't execute
		}

		try {
			await $`git tag -d ${tagName}`;
		} catch (error) {
			throw new Error(
				`Failed to delete tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async pushTag(tagName: string, dryRun = false): Promise<void> {
		if (dryRun) {
			return; // Just validate, don't execute
		}

		try {
			await $`git push origin ${tagName}`;
		} catch (error) {
			throw new Error(
				`Failed to push tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async deleteRemoteTag(tagName: string, dryRun = false): Promise<void> {
		if (dryRun) {
			return; // Just validate, don't execute
		}

		try {
			await $`git push origin :refs/tags/${tagName}`;
		} catch (error) {
			throw new Error(
				`Failed to delete remote tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	// High-level workflow methods
	static async createVersionTag(
		version: string,
		options: { message?: string; force?: boolean; dryRun?: boolean } = {},
	): Promise<void> {
		const tagName = EntityTag.toTag(version);
		const message = options.message || `Release version ${version}`;

		await EntityTag.createTag({
			tagName,
			message,
			force: options.force,
			dryRun: options.dryRun,
		});
	}

	static async deleteVersionTag(
		tagName: string,
		options: { dryRun?: boolean; deleteRemote?: boolean } = {},
	): Promise<void> {
		await EntityTag.deleteTag(tagName, options.dryRun);

		if (options.deleteRemote) {
			await EntityTag.deleteRemoteTag(tagName, options.dryRun);
		}
	}

	static async pushVersionTag(tagName: string, dryRun = false): Promise<void> {
		await EntityTag.pushTag(tagName, dryRun);
	}
}
