import type { InteractiveCLI } from "../shell/interactive-cli";
import { EntityCommit } from "./commit";
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

const imperativeWords = [
	"add",
	"update",
	"remove",
	"fix",
	"change",
	"improve",
	"refactor",
	"create",
	"delete",
	"modify",
	"implement",
	"enhance",
	"optimize",
	"streamline",
	"synchronize",
	"sync",
];

type Section = keyof CommitMessageData;
type CommitRules = Record<
	Section,
	{
		section: Section;
		question: string;
		placeholder: string;
		disabled?: true;
		validator: (...args: string[][]) => true | string;
		list?:
			| string[]
			| {
					type: CommitType;
					description: string;
					category: PRCategory;
					emoji: string;
					breakingAllowed: boolean;
			  }[];
	}
>;

const validScopes = await EntityWorkspace.getAllPackages();

export const commitRules = {
	type: {
		section: "type",
		question: "🎯 What type of change is this?",
		placeholder:
			"feat, fix, docs, style, refactor, perf, test, build, ci, chore, deps, revert, other",
		validator: (type: string[]): true | string => {
			const validTypes = commitRules.type.list.map((t) => t.type);
			const exists = validTypes.includes(type[0] as CommitType);
			return (
				exists || `type | invalid type: "${type}". valid types:\n    => ${validTypes.join(", ")}`
			);
		},
		list: [
			{
				type: "feat",
				description: "A new feature",
				category: "features",
				emoji: "🚀",
				breakingAllowed: true,
			},
			{
				type: "fix",
				description: "A bug fix",
				category: "bugfixes",
				emoji: "🐛",
				breakingAllowed: true,
			},
			{
				type: "docs",
				description: "Documentation only changes",
				category: "documentation",
				emoji: "📚",
				breakingAllowed: false,
			},
			{
				type: "style",
				description: "Changes that do not affect the meaning of the code",
				category: "refactoring",
				emoji: "💄",
				breakingAllowed: false,
			},
			{
				type: "refactor",
				description: "A code change that neither fixes a bug nor adds a feature",
				category: "refactoring",
				emoji: "🔧",
				breakingAllowed: true,
			},
			{
				type: "perf",
				description: "A code change that improves performance",
				category: "refactoring",
				emoji: "⚡",
				breakingAllowed: true,
			},
			{
				type: "test",
				description: "Adding missing tests or correcting existing tests",
				category: "infrastructure",
				emoji: "🧪",
				breakingAllowed: false,
			},
			{
				type: "build",
				description: "Changes that affect the build system or external dependencies",
				category: "infrastructure",
				emoji: "📦",
				breakingAllowed: false,
			},
			{
				type: "ci",
				description: "Changes to CI configuration files and scripts",
				category: "infrastructure",
				emoji: "👷",
				breakingAllowed: false,
			},
			{
				type: "chore",
				description: "Other changes that don't modify src or test files",
				category: "other",
				emoji: "🔨",
				breakingAllowed: false,
			},
			{
				type: "deps",
				description: "Dependency updates and changes",
				category: "dependencies",
				emoji: "📦",
				breakingAllowed: true,
			},
			{
				type: "revert",
				description: "Reverts a previous commit",
				category: "other",
				emoji: "⏪",
				breakingAllowed: true,
			},
			{
				type: "other",
				description: "Other types of changes",
				category: "other",
				emoji: "🔀",
				breakingAllowed: false,
			},
		],
	},
	scopes: {
		section: "scopes",
		question: "📦 What is the scope of this change? (optional)",
		placeholder: validScopes.join(", "),
		validator: (scopes: string[]): true | string => {
			if (!scopes.length) return true;
			if (scopes.every((scope) => !validScopes.includes(scope))) {
				return `scopes | invalid scope: "${scopes.join(", ")}". valid scopes:\n    => ${validScopes.join(", ")}`;
			}
			return true;
		},
		list: validScopes,
	},
	description: {
		section: "description",
		question: "📝 Short description of the change",
		placeholder: "a new feature",
		validator: ([desc]): true | string => {
			const firstWord = desc.split(" ")[0].toLowerCase();
			if (desc.length < 3) return "description | should be at least 3 characters long";
			if (desc.length > 72) return `description | should be max 72 chars, received: ${desc.length}`;
			if (desc.endsWith(".")) return "description | should not end with a period";
			if (!imperativeWords.includes(firstWord))
				return `description | should start with an imperative verb like:\n    => ${imperativeWords.join(", ")}`;
			return true;
		},
	},
	bodyLines: {
		section: "bodyLines",
		question: "📄 Longer description (optional)",
		placeholder: "a longer description of the change",
		validator: (bodyLines: string[]): true | string => {
			if (!bodyLines.length) return true;
			if (bodyLines.every((line) => line.length > 120))
				return "bodyLines | should be 120 characters or less";
			return true;
		},
	},
	isBreaking: {
		section: "isBreaking",
		question: "💥 Is this a breaking change?",
		placeholder: "true, false",
		validator: ([type, description]: string[]): true | string => {
			const breakingAllowedTypes = commitRules.type.list.filter((t) => t.breakingAllowed);
			const isBreakingAllowed = breakingAllowedTypes.some((t) => t.type === type);

			if (!isBreakingAllowed)
				return `isBreaking | breaking change is not allowed for this type, allowed types:\n    => ${breakingAllowedTypes.map((t) => t.type).join(", ")}`;
			if (!description.length) return "isBreaking | breaking change description cannot be empty";
			if (description.length < 10)
				return "isBreaking | breaking change description should be at least 10 characters long";
			return true;
		},
	},
	isMerge: {
		section: "isMerge",
		question: "🔀 Is this a merge commit?",
		placeholder: "true, false",
		disabled: true,
		validator: (): true | string => true,
	},
	isDependency: {
		section: "isDependency",
		question: "🔀 Is this a dependency commit?",
		placeholder: "true, false",
		disabled: true,
		validator: (): true | string => true,
	},
} as const satisfies CommitRules;

interface CLIStepHandler {
	key: keyof CommitMessageData;
	run: (cli: InteractiveCLI, message: string, errors?: string[]) => Promise<string>;
	validate: (message: string) => true | string;
}

export const cliSteps: CLIStepHandler[] = Object.entries(commitRules).map(([key, rule]) => ({
	key: key as keyof CommitMessageData,
	run: async (cli: InteractiveCLI, message: string, errors?: string[]) => {
		cli.clearScreen();
		const input = await cli.prompt(`${rule.question}\n\n${errors?.join("\n")}`, {
			placeholder: rule.placeholder,
		});

		return EntityCommit.formatCommitMessage({
			...EntityCommit.parseByMessage(message),
			[rule.section]: input.trim(),
		});
	},
	validate: (message: string): true | string => {
		const parsedMessage = EntityCommit.parseByMessage(message);
		return rule.validator(
			parsedMessage.isBreaking
				? [parsedMessage.type, parsedMessage.description]
				: Array.isArray(parsedMessage[key as keyof CommitMessageData])
					? (parsedMessage[key as keyof CommitMessageData] as string[])
					: [parsedMessage[key as keyof CommitMessageData] as string],
		);
	},
}));
