import type { ParsedCommitData } from "./types";

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

export type PRInfo = {
	prNumber: string;
	prCategory: PRCategory;
	prStats: PRStats;
	prCommits: ParsedCommitData[];
	prBranchName: string;
};

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
