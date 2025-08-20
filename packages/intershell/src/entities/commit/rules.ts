import { EntityPackages } from "../packages";
import type { CommitConfig, CommitRule } from "./types";

const allPackages = await EntityPackages.getAllPackages();

const defaultConfig: CommitConfig = {
	type: {
		list: [
			{
				type: "feat",
				label: "Features",
				description: "A new feature",
				category: "features" as const,
				emoji: "🚀",
				badgeColor: "00D4AA",
				breakingAllowed: true,
			},
			{
				type: "fix",
				label: "Bug Fixes",
				description: "A bug fix",
				category: "bugfixes" as const,
				emoji: "🐛",
				badgeColor: "EF4444",
				breakingAllowed: true,
			},
			{
				type: "docs",
				label: "Documentation",
				description: "Documentation only changes",
				category: "documentation" as const,
				emoji: "📚",
				badgeColor: "646CFF",
				breakingAllowed: false,
			},
			{
				type: "style",
				label: "Style",
				description: "Changes that do not affect the meaning of the code",
				category: "refactoring" as const,
				emoji: "🎨",
				badgeColor: "8B5CF6",
				breakingAllowed: false,
			},
			{
				type: "refactor",
				label: "Refactoring",
				description: "A code change that neither fixes a bug nor adds a feature",
				category: "refactoring" as const,
				emoji: "🔧",
				badgeColor: "007ACC",
				breakingAllowed: true,
			},
			{
				type: "perf",
				label: "Performance",
				description: "A code change that improves performance",
				category: "refactoring" as const,
				emoji: "⚡",
				badgeColor: "60a5fa",
				breakingAllowed: true,
			},
			{
				type: "test",
				label: "Testing",
				description: "Adding missing tests or correcting existing tests",
				category: "infrastructure" as const,
				emoji: "🧪",
				badgeColor: "10B981",
				breakingAllowed: false,
			},
			{
				type: "ci",
				label: "CI/CD",
				description: "Changes to CI configuration files and scripts",
				category: "infrastructure" as const,
				emoji: "👷",
				badgeColor: "2496ED",
				breakingAllowed: false,
			},
			{
				type: "chore",
				label: "Chores",
				description: "Other changes that don't modify src or test files",
				category: "other" as const,
				emoji: "🔨",
				badgeColor: "495057",
				breakingAllowed: false,
			},
			{
				type: "revert",
				label: "Revert",
				description: "Reverts a previous commit",
				category: "other" as const,
				emoji: "⏪",
				badgeColor: "DC2626",
				breakingAllowed: true,
			},
			{
				type: "merge",
				label: "Merge",
				description: "Merge commits (pull requests, branches)",
				category: "other" as const,
				emoji: "🔀",
				badgeColor: "6B7280",
				breakingAllowed: false,
			},
			{
				type: "deps",
				label: "Dependencies",
				description: "Dependency updates and changes",
				category: "dependencies" as const,
				emoji: "📦",
				badgeColor: "059669",
				breakingAllowed: true,
			},
			{
				type: "other",
				label: "Other",
				description: "Other types of changes",
				category: "other" as const,
				emoji: "⚠️",
				badgeColor: "6B7280",
				breakingAllowed: false,
			},
		] as const,
	},
	scopes: {
		list: allPackages,
	},
	description: {
		minLength: 3,
		maxLength: 100,
		shouldNotEndWithPeriod: true,
		shouldNotStartWithType: true,
	},
	bodyLines: {
		minLength: 120,
		maxLength: 120,
	},
};

class CommitRules {
	private config: CommitConfig;
	private rules: CommitRule[] = [];

	constructor(config: CommitConfig = defaultConfig) {
		this.config = this.mergeConfig(config);
		this.rules = this.createRules();
	}

	getRules(): CommitRule[] {
		return this.rules;
	}

	getConfig(): CommitConfig {
		return this.config;
	}

	private mergeConfig(config: Partial<CommitConfig>): CommitConfig {
		return {
			...defaultConfig,
			...config,
			type: {
				...defaultConfig.type,
				...config.type,
			},
			scopes: {
				...defaultConfig.scopes,
				...config.scopes,
			},
			description: {
				...defaultConfig.description,
				...config.description,
			},
			bodyLines: {
				...defaultConfig.bodyLines,
				...config.bodyLines,
			},
		};
	}

	private createRules(): CommitRule[] {
		const config = this.config;
		return [
			{
				section: "type",
				question: `🎯 What type of change is this?\n=> [${config.type?.list?.map((t) => t.type).join(", ")}]`,
				validator: (commit): true | string => {
					const type = commit.message.type;
					if (config.type?.list?.length === 0) return true;

					const exists = config.type?.list?.map((t) => t.type).includes(type);
					return (
						exists ||
						config.type?.validator?.(commit) ||
						`invalid type: "${type}". valid types:\n  => ${config.type?.list?.map((t) => t.type).join(", ")}`
					);
				},
				list: config.type?.list?.map((t) => t.type),
			},
			{
				section: "scopes",
				question: `📦 What is the scope of this change? (optional)\n=> [${config.scopes?.list?.join(", ")}]`,
				validator: (commit): true | string => {
					const scopes = commit.message.scopes;
					if (!scopes?.length) return true;
					if (config.scopes?.list?.length === 0) return true;

					const invalidScopes = scopes.filter((scope) => !config.scopes?.list?.includes(scope));
					if (invalidScopes.length > 0) {
						return `invalid scope(s): "${invalidScopes.join(", ")}". valid scopes:\n  => ${config.scopes?.list?.join(", ")}`;
					}

					return config.scopes?.validator?.(commit) || true;
				},
				list: config.scopes?.list ?? [],
			},
			{
				section: "description",
				question:
					"📝 Short description of the change\n=> (e.g. a new feature, a bug fix, a documentation update, etc.)",
				validator: (commit): true | string => {
					const desc = commit.message.description;
					const firstWord = desc.split(" ")[0].toLowerCase();
					const minLength = config.description?.minLength;
					if (minLength !== undefined && desc.length < minLength)
						return `should be at least ${minLength} characters long`;

					const maxLength = config.description?.maxLength;
					if (maxLength !== undefined && desc.length > maxLength)
						return `should be max ${maxLength} chars, received: ${desc.length}`;

					const shouldNotEndWithPeriod = config.description?.shouldNotEndWithPeriod;
					if (shouldNotEndWithPeriod && desc.endsWith(".")) return "should not end with a period";

					const shouldNotStartWithType = config.description?.shouldNotStartWithType;
					if (shouldNotStartWithType && config.type?.list?.map((t) => t.type).includes(firstWord))
						return `should not start with a type: "${firstWord}". You're either duplicating the type or should use a different type.`;

					return config.description?.validator?.(commit) || true;
				},
			},
			{
				section: "bodyLines",
				question:
					"📄 Longer description (optional)\n  => (e.g. a longer description of the change, a detailed explanation of the change, etc.)",
				validator: (commit): true | string => {
					const bodyLines = commit.message.bodyLines;
					if (!bodyLines.length) return true;

					const minLength = config.bodyLines?.minLength;
					if (minLength !== undefined && bodyLines.every((line) => line.length < minLength))
						return `should be ${minLength} characters or more`;

					const maxLength = config.bodyLines?.maxLength;
					if (maxLength !== undefined && bodyLines.every((line) => line.length > maxLength))
						return `should be ${maxLength} characters or less`;

					return config.bodyLines?.validator?.(commit) || true;
				},
			},
			{
				section: "isBreaking",
				question: "💥 Is this a breaking change?\n=> (e.g. true, false)",
				validator: (commit): true | string => {
					const type = commit.message.type;
					const description = commit.message.description;
					const breakingAllowedTypes = config.type?.list
						?.filter((t) => t.breakingAllowed)
						?.map((t) => t.type);
					const isBreakingAllowed = breakingAllowedTypes?.includes(type);

					if (commit.message.isBreaking && !isBreakingAllowed)
						return `breaking change is not allowed for this type, allowed types:\n  => ${breakingAllowedTypes?.join(", ")}`;
					if (!description.length) return "breaking change description cannot be empty";
					if (description.length < 10)
						return "breaking change description should be at least 10 characters long";

					return config.isBreaking?.validator?.(commit) || true;
				},
			},
			{
				section: "isMerge",
				question: "",
				validator: (commit): true | string => {
					return config.isMerge?.validator?.(commit) || true;
				},
			},
			{
				section: "isDependency",
				question: "",
				validator: (commit): true | string => {
					return config.isDependency?.validator?.(commit) || true;
				},
			},
		];
	}
}

export const commitRules = new CommitRules(defaultConfig);
