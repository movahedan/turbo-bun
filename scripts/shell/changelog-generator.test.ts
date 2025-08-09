/** biome-ignore-all lint/suspicious/noExplicitAny: used for testing */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import { ChangelogGenerator } from "./changelog-generator";
import type { ChangelogEntry, PRCategory } from "./version-utils";

// Mock Bun's $ function
const mockShellResults = new Map<string, { exitCode: number; text: () => string }>();

const mock$ = mock((cmd: TemplateStringsArray, ...args: any[]) => {
	const fullCmd = cmd.join("").replace(/\$\{[^}]+\}/g, (match) => {
		const argIndex = Number.parseInt(match.slice(2, -1)) - 1;
		return args[argIndex] || "";
	});

	const result = mockShellResults.get(fullCmd) || { exitCode: 1, text: () => "" };
	return Promise.resolve({
		...result,
		quiet: () => ({ nothrow: () => Promise.resolve(result) }),
		nothrow: () => Promise.resolve(result),
	});
});

// Mock the imports
mock.module("bun", () => ({ $: mock$ }));

describe("ChangelogGenerator", () => {
	let generator: ChangelogGenerator;

	beforeEach(() => {
		generator = new ChangelogGenerator();
		mockShellResults.clear();
	});

	describe("generateContent", () => {
		test("should generate basic changelog structure", async () => {
			const entries: ChangelogEntry[] = [];
			const config = {
				displayVersion: "v1.0.0",
				packageName: "test-package",
				repositoryUrl: "https://github.com/test/repo",
			};

			const result = await generator.generateContent(entries, config);

			expect(result).toContain("# Changelog - test-package");
			expect(result).toContain("## v1.0.0");
			expect(result).toContain(
				"All notable changes to this project will be documented in this file.",
			);
			expect(result).toContain(
				"*This changelog was automatically generated using our custom versioning script* ⚡",
			);
		});

		test("should generate changelog without package name", async () => {
			const entries: ChangelogEntry[] = [];
			const config = {
				displayVersion: "v1.0.0",
			};

			const result = await generator.generateContent(entries, config);

			expect(result).toContain("# Changelog\n");
			expect(result).not.toContain("# Changelog -");
		});

		test("should categorize and display PRs correctly", async () => {
			const entries: ChangelogEntry[] = [
				{
					type: "feat",
					description: "Merge pull request #123 from user/feature-branch",
					breaking: false,
					hash: "abc1234",
					isMerge: true,
					prNumber: "123",
					prCategory: "features" as PRCategory,
					prStats: { commitCount: 3 },
					body: "This is a great new feature\nWith multiple lines\nOf description",
					prCommits: [
						{ hash: "commit1", message: "feat: implement feature" },
						{ hash: "commit2", message: "test: add tests" },
						{ hash: "commit3", message: "docs: update docs" },
					],
				},
			];

			const config = {
				displayVersion: "v1.0.0",
				repositoryUrl: "https://github.com/test/repo",
			};

			const result = await generator.generateContent(entries, config);

			expect(result).toContain("### 🚀 feature-branch");
			expect(result).toContain("Feature%20Releases");
			expect(result).toContain("#123");
			expect(result).toContain("3%20commits");
			expect(result).toContain("This is a great new feature");
			expect(result).toContain("With multiple lines");
			expect(result).toContain("Of description");
		});

		test("should create collapsible sections for direct commits", async () => {
			const entries: ChangelogEntry[] = [
				{
					type: "fix",
					description: "fix critical bug",
					breaking: false,
					hash: "abc1234",
					author: "Jane Doe",
				},
				{
					type: "feat",
					description: "add awesome feature",
					breaking: false,
					hash: "def5678",
					author: "John Doe",
				},
			];

			// Mock getAuthorEmail calls
			mockShellResults.set('git log --author="Jane Doe" --pretty=format:"%ae" -1', {
				exitCode: 0,
				text: () => "jane@example.com",
			});
			mockShellResults.set('git log --author="John Doe" --pretty=format:"%ae" -1', {
				exitCode: 0,
				text: () => "john@example.com",
			});

			const config = {
				displayVersion: "v1.0.0",
				repositoryUrl: "https://github.com/test/repo",
			};

			const result = await generator.generateContent(entries, config);

			expect(result).toContain("<details>");
			expect(result).toContain(
				"<summary><strong>🐛 Bug Fixes</strong> (Click to expand)</summary>",
			);
			expect(result).toContain("<summary><strong>✨ Features</strong> (Click to expand)</summary>");
			expect(result).toContain("jane@example.com");
			expect(result).toContain("john@example.com");
		});

		test("should separate dependency commits and PRs", async () => {
			const entries: ChangelogEntry[] = [
				{
					type: "chore",
					scope: "deps",
					description: "update package.json",
					breaking: false,
					hash: "abc1234",
				},
				{
					type: "feat",
					description: "Merge pull request #124 from renovate/update-deps",
					breaking: false,
					hash: "def5678",
					isMerge: true,
					prNumber: "124",
					prCategory: "dependencies" as PRCategory,
					prStats: { commitCount: 1 },
				},
			];

			const config = {
				displayVersion: "v1.0.0",
				repositoryUrl: "https://github.com/test/repo",
			};

			const result = await generator.generateContent(entries, config);

			expect(result).toContain("📦 <strong>Dependency Updates</strong> (Click to expand)");
			expect(result).toContain("### 📦 Dependencies");
			expect(result).toContain("### 📦 update-deps");
		});

		test("should handle breaking changes", async () => {
			const entries: ChangelogEntry[] = [
				{
					type: "feat",
					description: "major API overhaul",
					breaking: true,
					hash: "abc1234",
					author: "Developer",
				},
			];

			const config = {
				displayVersion: "v2.0.0",
			};

			const result = await generator.generateContent(entries, config);

			expect(result).toContain(
				"<summary><strong>💥 Breaking Changes</strong> (Click to expand)</summary>",
			);
			expect(result).toContain("major API overhaul");
		});

		test("should generate commit badges with colors and links", async () => {
			const entries: ChangelogEntry[] = [
				{
					type: "feat",
					description: "Merge pull request #123 from user/feature-branch",
					breaking: false,
					hash: "abc1234",
					isMerge: true,
					prNumber: "123",
					prCategory: "features" as PRCategory,
					prStats: { commitCount: 2 },
					prCommits: [
						{ hash: "commit123", message: "feat: new feature" },
						{ hash: "commit456", message: "fix: bug fix" },
					],
				},
			];

			const config = {
				displayVersion: "v1.0.0",
				repositoryUrl: "https://github.com/test/repo",
			};

			const result = await generator.generateContent(entries, config);

			expect(result).toContain("feat-commit1-00D4AA");
			expect(result).toContain("fix-commit4-EF4444");
			expect(result).toContain("https://github.com/test/repo/commit/commit123");
			expect(result).toContain("https://github.com/test/repo/commit/commit456");
		});
	});

	describe("isDependencyCommit", () => {
		test("should identify dependency commits", () => {
			const testCases = [
				{ type: "chore", scope: "deps", description: "update package" },
				{ type: "chore", scope: undefined, description: "update dependencies" },
				{ type: "feat", scope: "renovate", description: "auto update" },
				{ type: "other", scope: undefined, description: "renovate: update package" },
			];

			testCases.forEach((entry) => {
				const result = (generator as any).isDependencyCommit(entry as ChangelogEntry);
				expect(result).toBe(true);
			});
		});

		test("should not identify non-dependency commits", () => {
			const testCases = [
				{ type: "feat", scope: "api", description: "add new endpoint" },
				{ type: "fix", scope: undefined, description: "resolve bug" },
				{ type: "chore", scope: undefined, description: "update documentation" },
			];

			testCases.forEach((entry) => {
				const result = (generator as any).isDependencyCommit(entry as ChangelogEntry);
				expect(result).toBe(false);
			});
		});
	});

	describe("parseCommitType", () => {
		test("should extract commit type from conventional commit", () => {
			const testCases = [
				{ message: "feat(api): add endpoint", expected: "feat" },
				{ message: "fix: resolve bug", expected: "fix" },
				{ message: "docs(readme): update", expected: "docs" },
				{ message: "random message", expected: "other" },
			];

			testCases.forEach(({ message, expected }) => {
				const result = (generator as any).parseCommitType(message);
				expect(result).toBe(expected);
			});
		});
	});

	describe("formatAuthorInfo", () => {
		test("should format author with email", () => {
			const result = (generator as any).formatAuthorInfo("John Doe", "john@example.com");
			expect(result).toBe("**John Doe** [john@example.com](mailto:john@example.com)");
		});

		test("should format author without email", () => {
			const result = (generator as any).formatAuthorInfo("John Doe");
			expect(result).toBe("**John Doe**");
		});
	});
});
