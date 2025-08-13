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

const validScopes = [...(await EntityWorkspace.getAllPackages()), "deps", "scripts"];

const createCommitType = (
	type: CommitType,
	label: string,
	description: string,
	category: PRCategory,
	emoji: string,
	badgeColor: string,
	breakingAllowed: boolean,
) => ({
	type,
	label,
	description,
	category,
	emoji,
	badgeColor,
	breakingAllowed,
});

export const validTypes = [
	createCommitType("feat", "🚀 Features", "A new feature", "features", "🚀", "00D4AA", true),
	createCommitType("fix", "🐛 Bug Fixes", "A bug fix", "bugfixes", "🐛", "EF4444", true),
	createCommitType(
		"docs",
		"📚 Documentation",
		"Documentation only changes",
		"documentation",
		"📚",
		"646CFF",
		false,
	),
	createCommitType(
		"style",
		"🎨 Style",
		"Changes that do not affect the meaning of the code",
		"refactoring",
		"💄",
		"8B5CF6",
		false,
	),
	createCommitType(
		"refactor",
		"🔄 Refactoring",
		"A code change that neither fixes a bug nor adds a feature",
		"refactoring",
		"🔧",
		"007ACC",
		true,
	),
	createCommitType(
		"perf",
		"⚡ Performance",
		"A code change that improves performance",
		"refactoring",
		"⚡",
		"60a5fa",
		true,
	),
	createCommitType(
		"test",
		"🧪 Testing",
		"Adding missing tests or correcting existing tests",
		"infrastructure",
		"🧪",
		"10B981",
		false,
	),
	createCommitType(
		"build",
		"📦 Build",
		"Changes that affect the build system or external dependencies",
		"infrastructure",
		"📦",
		"F59E0B",
		false,
	),
	createCommitType(
		"ci",
		"🚀 CI/CD",
		"Changes to CI configuration files and scripts",
		"infrastructure",
		"👷",
		"2496ED",
		false,
	),
	createCommitType(
		"chore",
		"🔧 Chores",
		"Other changes that don't modify src or test files",
		"other",
		"🔨",
		"495057",
		false,
	),
	createCommitType(
		"revert",
		"⏪ Revert",
		"Reverts a previous commit",
		"other",
		"⏪",
		"DC2626",
		true,
	),
	createCommitType(
		"merge",
		"🔀 Merge",
		"Merge commits (pull requests, branches)",
		"other",
		"🔀",
		"6B7280",
		false,
	),
	createCommitType(
		"deps",
		"📦 Dependencies",
		"Dependency updates and changes",
		"dependencies",
		"📦",
		"059669",
		true,
	),
	createCommitType("other", "🔀 Other", "Other types of changes", "other", "🔀", "6B7280", false),
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
