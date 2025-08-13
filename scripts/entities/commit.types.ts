import { EntityWorkspace } from "./workspace";

export const validBranchPrefixes = [
	"main",
	"release",
	"feature",
	"fix",
	"hotfix",
	"docs",
	"refactor",
	"ci",
	"chore",
	"wip",
	"renovate",
] as const;

export type CommitType =
	| "feat"
	| "fix"
	| "docs"
	| "style"
	| "refactor"
	| "perf"
	| "test"
	| "build"
	| "ci"
	| "chore"
	| "deps"
	| "revert"
	| "merge"
	| "other";

export type CommitMessageData =
	| {
			type: "other";
			scopes?: string[];
			description: string;
			bodyLines?: string[];
			isBreaking: boolean;
			isMerge: boolean;
			isDependency: boolean;
	  }
	| {
			type: CommitType;
			scopes?: string[];
			description: string;
			bodyLines?: string[];
			isBreaking: boolean;
			isMerge: boolean;
			isDependency: boolean;
	  };

export interface ParsedCommitData {
	message: CommitMessageData;
	info: {
		hash: string;
		author?: string;
		date?: string;
	};
	pr?: {
		prNumber?: string;
		prCategory?: PRCategory;
		prStats?: PRStats;
		prCommits?: ParsedCommitData[];
	};
}

export const prCategories: Record<PRCategory, { emoji: string; label: string }> = {
	features: {
		emoji: "🚀",
		label: "Feature Releases",
	},
	infrastructure: {
		emoji: "🛠️",
		label: "Infrastructure & Tooling",
	},
	bugfixes: {
		emoji: "🐛",
		label: "Bug Fixes & Improvements",
	},
	refactoring: {
		emoji: "🔄",
		label: "Code Quality & Refactoring",
	},
	documentation: {
		emoji: "📚",
		label: "Documentation",
	},
	dependencies: {
		emoji: "📦",
		label: "Dependency Updates",
	},
	other: {
		emoji: "🔄",
		label: "Other Changes",
	},
};
export type PRCategory =
	| "features"
	| "bugfixes"
	| "dependencies"
	| "infrastructure"
	| "documentation"
	| "refactoring"
	| "other";

export interface PRStats {
	readonly commitCount: number;
	readonly fileCount?: number;
	readonly linesAdded?: number;
	readonly linesDeleted?: number;
}

type Section = keyof CommitMessageData;
type CommitRules = Record<
	Section,
	{
		section: Section;
		question: string;
		validator: (...args: string[][]) => true | string;
		list?: string[];
	}
>;

const validScopes = [...(await EntityWorkspace.getAllPackages()), "deps"];
export const validTypes: {
	type: CommitType;
	label: string;
	description: string;
	category: PRCategory;
	emoji: string;
	badgeColor: string;
	breakingAllowed: boolean;
}[] = [
	{
		type: "feat",
		label: "🚀 Features",
		description: "A new feature",
		category: "features",
		emoji: "🚀",
		badgeColor: "00D4AA",
		breakingAllowed: true,
	},
	{
		type: "fix",
		label: "🐛 Bug Fixes",
		description: "A bug fix",
		category: "bugfixes",
		emoji: "🐛",
		badgeColor: "EF4444",
		breakingAllowed: true,
	},
	{
		type: "docs",
		label: "📚 Documentation",
		description: "Documentation only changes",
		category: "documentation",
		emoji: "📚",
		badgeColor: "646CFF",
		breakingAllowed: false,
	},
	{
		type: "style",
		label: "🎨 Style",
		description: "Changes that do not affect the meaning of the code",
		category: "refactoring",
		emoji: "💄",
		badgeColor: "8B5CF6",
		breakingAllowed: false,
	},
	{
		type: "refactor",
		label: "🔄 Refactoring",
		description: "A code change that neither fixes a bug nor adds a feature",
		category: "refactoring",
		emoji: "🔧",
		badgeColor: "007ACC",
		breakingAllowed: true,
	},
	{
		type: "perf",
		label: "⚡ Performance",
		description: "A code change that improves performance",
		category: "refactoring",
		emoji: "⚡",
		badgeColor: "60a5fa",
		breakingAllowed: true,
	},
	{
		type: "test",
		label: "🧪 Testing",
		description: "Adding missing tests or correcting existing tests",
		category: "infrastructure",
		emoji: "🧪",
		badgeColor: "10B981",
		breakingAllowed: false,
	},
	{
		type: "build",
		label: "📦 Build",
		description: "Changes that affect the build system or external dependencies",
		category: "infrastructure",
		emoji: "📦",
		badgeColor: "F59E0B",
		breakingAllowed: false,
	},
	{
		type: "ci",
		label: "🚀 CI/CD",
		description: "Changes to CI configuration files and scripts",
		category: "infrastructure",
		emoji: "👷",
		badgeColor: "2496ED",
		breakingAllowed: false,
	},
	{
		type: "chore",
		label: "🔧 Chores",
		description: "Other changes that don't modify src or test files",
		category: "other",
		emoji: "🔨",
		badgeColor: "495057",
		breakingAllowed: false,
	},
	{
		type: "revert",
		label: "⏪ Revert",
		description: "Reverts a previous commit",
		category: "other",
		emoji: "⏪",
		badgeColor: "DC2626",
		breakingAllowed: true,
	},
	{
		type: "merge",
		label: "🔀 Merge",
		description: "Merge commits (pull requests, branches)",
		category: "other",
		emoji: "🔀",
		badgeColor: "6B7280",
		breakingAllowed: false,
	},
	{
		type: "deps",
		label: "📦 Dependencies",
		description: "Dependency updates and changes",
		category: "dependencies",
		emoji: "📦",
		badgeColor: "059669",
		breakingAllowed: true,
	},
	{
		type: "other",
		label: "🔀 Other",
		description: "Other types of changes",
		category: "other",
		emoji: "🔀",
		badgeColor: "6B7280",
		breakingAllowed: false,
	},
];

export const commitRules = {
	type: {
		section: "type",
		question: `🎯 What type of change is this?\n=> [${validTypes.map((t) => t.type).join(", ")}]`,
		validator: (type: string[]): true | string => {
			const exists = validTypes.map((t) => t.type).includes(type[0] as CommitType);
			return (
				exists ||
				`type | invalid type: "${type}". valid types:\n  => ${validTypes.map((t) => t.type).join(", ")}`
			);
		},
		list: validTypes.map((t) => t.type),
	},
	scopes: {
		section: "scopes",
		question: `📦 What is the scope of this change? (optional)\n=> [${validScopes.join(", ")}]`,
		validator: (scopes: string[]): true | string => {
			if (!scopes.length) return true;
			if (scopes.every((scope) => !validScopes.includes(scope))) {
				return `scopes | invalid scope: "${scopes.join(", ")}". valid scopes:\n  => ${validScopes.join(", ")}`;
			}
			return true;
		},
		list: validScopes,
	},
	description: {
		section: "description",
		question:
			"📝 Short description of the change\n=> (e.g. a new feature, a bug fix, a documentation update, etc.)",
		validator: ([desc]): true | string => {
			const firstWord = desc.split(" ")[0].toLowerCase();
			if (desc.length < 3) return "description | should be at least 3 characters long";
			if (desc.length > 72) return `description | should be max 72 chars, received: ${desc.length}`;
			if (desc.endsWith(".")) return "description | should not end with a period";
			if (validTypes.map((t) => t.type).includes(firstWord as CommitType))
				return `description | should not start with a type: "${firstWord}". You're either duplicating the type or should use a different type.`;
			return true;
		},
	},
	bodyLines: {
		section: "bodyLines",
		question:
			"📄 Longer description (optional)\n  => (e.g. a longer description of the change, a detailed explanation of the change, etc.)",
		validator: (bodyLines: string[]): true | string => {
			if (!bodyLines.length) return true;
			if (bodyLines.every((line) => line.length > 120))
				return "bodyLines | should be 120 characters or less";
			return true;
		},
	},
	isBreaking: {
		section: "isBreaking",
		question: "💥 Is this a breaking change?\n=> (e.g. true, false)",
		validator: ([type, description]: string[]): true | string => {
			const breakingAllowedTypes = validTypes.filter((t) => t.breakingAllowed).map((t) => t.type);
			const isBreakingAllowed = breakingAllowedTypes.includes(type as CommitType);

			if (!isBreakingAllowed)
				return `isBreaking | breaking change is not allowed for this type, allowed types:\n  => ${breakingAllowedTypes.join(", ")}`;
			if (!description.length) return "isBreaking | breaking change description cannot be empty";
			if (description.length < 10)
				return "isBreaking | breaking change description should be at least 10 characters long";
			return true;
		},
	},
	isMerge: {
		section: "isMerge",
		question: "",
		validator: (): true | string => true,
	},
	isDependency: {
		section: "isDependency",
		question: "",
		validator: (): true | string => true,
	},
} as const satisfies CommitRules;
