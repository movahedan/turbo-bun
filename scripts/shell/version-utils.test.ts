/** biome-ignore-all lint/suspicious/noExplicitAny: used for testing */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import { type ChangelogEntry, type CommitInfo, VersionUtils } from "./version-utils";

// Mock the repo-utils dependency
const mockRepoUtils = {
	packageJson: (packageName: string) => ({
		getDir: () =>
			packageName === "root"
				? "."
				: packageName.startsWith("@repo/")
					? `packages/${packageName.replace("@repo/", "")}`
					: `apps/${packageName}`,
	}),
	tags: {
		baseTagSha: (tag?: string) => Promise.resolve(tag || "abc123"),
	},
};

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
mock.module("./repo-utils", () => ({ repoUtils: mockRepoUtils }));
mock.module("./changelog-generator", () => ({
	ChangelogGenerator: class MockChangelogGenerator {
		async generateContent(entries: any, config: any) {
			return `# Changelog${config.packageName ? ` - ${config.packageName}` : ""}

## ${config.displayVersion}

Mock changelog content with ${entries.length} entries

---

*This changelog was automatically generated using our custom versioning script* ⚡
`;
		}
	},
}));
mock.module("bun", () => ({ $: mock$ }));

describe("VersionUtils", () => {
	let versionUtils: VersionUtils;

	beforeEach(() => {
		versionUtils = new VersionUtils();
		mockShellResults.clear();
	});

	describe("parseCommit", () => {
		test("should parse conventional commit format", () => {
			const result = (versionUtils as any).parseCommit("feat(api): add user authentication");

			expect(result).toEqual({
				type: "feat",
				scope: "api",
				description: "add user authentication",
				breaking: false,
			});
		});

		test("should parse commit without scope", () => {
			const result = (versionUtils as any).parseCommit("fix: resolve login bug");

			expect(result).toEqual({
				type: "fix",
				scope: undefined,
				description: "resolve login bug",
				breaking: false,
			});
		});

		test("should detect breaking changes", () => {
			const result = (versionUtils as any).parseCommit(
				"feat!: major API changes BREAKING CHANGE: removed old endpoint",
			);

			expect(result.breaking).toBe(true);
		});

		test("should handle non-conventional commits", () => {
			const result = (versionUtils as any).parseCommit("random commit message");

			expect(result).toEqual({
				type: "other",
				description: "random commit message",
				breaking: false,
			});
		});
	});

	describe("categorizePR", () => {
		test("should categorize as dependencies based on merge message", () => {
			const prCommits: CommitInfo[] = [{ hash: "abc123", message: "chore: update package" }];

			const result = (versionUtils as any).categorizePR(
				prCommits,
				"Merge pull request #123 from renovate/update-deps",
				"",
			);
			expect(result).toBe("dependencies");
		});

		test("should categorize as features based on commit types", () => {
			const prCommits: CommitInfo[] = [
				{ hash: "abc123", message: "feat: add new feature" },
				{ hash: "def456", message: "docs: update readme" },
			];

			const result = (versionUtils as any).categorizePR(prCommits, "Merge pull request #123", "");
			expect(result).toBe("features");
		});

		test("should categorize as bugfixes", () => {
			const prCommits: CommitInfo[] = [
				{ hash: "abc123", message: "fix: resolve critical bug" },
				{ hash: "def456", message: "fix: another bug" },
			];

			const result = (versionUtils as any).categorizePR(prCommits, "Merge pull request #123", "");
			expect(result).toBe("bugfixes");
		});

		test("should categorize as infrastructure", () => {
			const prCommits: CommitInfo[] = [
				{ hash: "abc123", message: "ci: update workflow" },
				{ hash: "def456", message: "build: improve build process" },
			];

			const result = (versionUtils as any).categorizePR(prCommits, "Merge pull request #123", "");
			expect(result).toBe("infrastructure");
		});

		test("should fall back to other for mixed commits", () => {
			const prCommits: CommitInfo[] = [{ hash: "abc123", message: "random: some change" }];

			const result = (versionUtils as any).categorizePR(prCommits, "Merge pull request #123", "");
			expect(result).toBe("other");
		});
	});

	describe("getNextVersion", () => {
		test("should increment major version", () => {
			const result = versionUtils.getNextVersion("1.2.3", "major");
			expect(result).toBe("2.0.0");
		});

		test("should increment minor version", () => {
			const result = versionUtils.getNextVersion("1.2.3", "minor");
			expect(result).toBe("1.3.0");
		});

		test("should increment patch version", () => {
			const result = versionUtils.getNextVersion("1.2.3", "patch");
			expect(result).toBe("1.2.4");
		});

		test("should throw error for invalid version", () => {
			expect(() => versionUtils.getNextVersion("invalid", "patch")).toThrow();
		});
	});

	describe("detectBumpType", () => {
		test("should detect major bump for breaking changes", async () => {
			mockShellResults.set("git rev-list -n 1 ", { exitCode: 0, text: () => "abc123" });
			mockShellResults.set('git log HEAD --oneline --pretty=format:"%H|%s"  -- .', {
				exitCode: 0,
				text: () => "abc123|feat!: breaking change BREAKING CHANGE: removed API",
			});

			const result = await versionUtils.detectBumpType("root");
			expect(result).toBe("major");
		});

		test("should detect minor bump for features", async () => {
			mockShellResults.set("git rev-list -n 1 ", { exitCode: 0, text: () => "abc123" });
			mockShellResults.set('git log HEAD --oneline --pretty=format:"%H|%s"  -- .', {
				exitCode: 0,
				text: () => "abc123|feat: add new feature",
			});

			const result = await versionUtils.detectBumpType("root");
			expect(result).toBe("minor");
		});

		test("should detect patch bump for fixes", async () => {
			mockShellResults.set("git rev-list -n 1 ", { exitCode: 0, text: () => "abc123" });
			mockShellResults.set('git log HEAD --oneline --pretty=format:"%H|%s"  -- .', {
				exitCode: 0,
				text: () => "abc123|fix: resolve bug",
			});

			const result = await versionUtils.detectBumpType("root");
			expect(result).toBe("patch");
		});

		test("should return undefined for no commits", async () => {
			mockShellResults.set("git rev-list -n 1 ", { exitCode: 0, text: () => "abc123" });
			mockShellResults.set('git log HEAD --oneline --pretty=format:"%H|%s"  -- .', {
				exitCode: 0,
				text: () => "",
			});

			const result = await versionUtils.detectBumpType("root");
			expect(result).toBeUndefined();
		});
	});

	describe("parseCommitToChangelogEntry", () => {
		test("should convert CommitInfo to ChangelogEntry", () => {
			const commit: CommitInfo = {
				hash: "abcdef123456789",
				author: "John Doe",
				message: "feat(api): add user authentication",
				body: "Detailed description",
				isMerge: false,
			};

			const result = versionUtils.parseCommitToChangelogEntry(commit);

			expect(result).toEqual({
				type: "feat",
				scope: "api",
				description: "add user authentication",
				breaking: false,
				hash: "abcdef1", // Should be truncated to 7 chars
				author: "John Doe",
				body: "Detailed description",
				isMerge: false,
			});
		});
	});

	describe("compareVersionHeaders", () => {
		test("should sort versions in descending order", () => {
			const versions = ["## v1.0.0", "## v2.0.0", "## v1.5.0"];
			const sorted = versions.sort((a, b) => (versionUtils as any).compareVersionHeaders(a, b));

			expect(sorted).toEqual(["## v2.0.0", "## v1.5.0", "## v1.0.0"]);
		});

		test("should put Unreleased at the top", () => {
			const versions = ["## v1.0.0", "## Unreleased", "## v2.0.0"];
			const sorted = versions.sort((a, b) => (versionUtils as any).compareVersionHeaders(a, b));

			expect(sorted).toEqual(["## Unreleased", "## v2.0.0", "## v1.0.0"]);
		});
	});

	describe("extractHeader", () => {
		test("should extract header from changelog", () => {
			const changelog = `# Changelog - test

All notable changes to this project will be documented in this file.

## v1.0.0

Some changes here`;

			const result = (versionUtils as any).extractHeader(changelog);

			expect(result).toBe(`# Changelog - test

All notable changes to this project will be documented in this file.`);
		});

		test("should return default header if no versions found", () => {
			const changelog = `# Some Title

Some content without versions`;

			const result = (versionUtils as any).extractHeader(changelog);

			expect(result).toContain("# Changelog");
		});
	});

	describe("parseChangelogVersions", () => {
		test("should parse versions from changelog", () => {
			const changelog = `# Changelog

## v2.0.0

New features

## v1.0.0

Initial release`;

			const result = (versionUtils as any).parseChangelogVersions(changelog);

			expect(result.size).toBe(2);
			expect(result.has("## v2.0.0")).toBe(true);
			expect(result.has("## v1.0.0")).toBe(true);
		});
	});

	describe("generateChangelogContent", () => {
		test("should generate changelog with package name", async () => {
			const entries: ChangelogEntry[] = [
				{
					type: "feat",
					description: "add new feature",
					breaking: false,
					hash: "abc1234",
					author: "John Doe",
				},
			];

			const result = await versionUtils.generateChangelogContent(
				entries,
				"v1.0.0",
				"https://github.com/test/repo",
				"test-package",
			);

			expect(result).toContain("# Changelog - test-package");
			expect(result).toContain("## v1.0.0");
			expect(result).toContain("Mock changelog content with 1 entries");
			expect(result).toContain(
				"*This changelog was automatically generated using our custom versioning script* ⚡",
			);
		});

		test("should generate changelog without package name", async () => {
			const entries: ChangelogEntry[] = [];

			const result = await versionUtils.generateChangelogContent(entries, "v1.0.0");

			expect(result).toContain("# Changelog\n");
			expect(result).not.toContain("# Changelog -");
			expect(result).toContain("Mock changelog content with 0 entries");
		});
	});

	describe("mergeChangelogRanges", () => {
		test("should merge new version into existing changelog", () => {
			const existing = `# Changelog - test

## v1.0.0

Old content`;

			const newContent = `# Changelog - test

## v2.0.0

New content

## v1.0.0

Updated old content`;

			const result = versionUtils.mergeChangelogRanges(existing, newContent, "abc123", "v2.0.0");

			expect(result).toContain("# Changelog - test");
			expect(result).toContain("## v2.0.0");
			expect(result).toContain("## v1.0.0");
			// Should have v2.0.0 before v1.0.0 (newest first)
			expect(result.indexOf("## v2.0.0")).toBeLessThan(result.indexOf("## v1.0.0"));
		});

		test("should use new header when merging", () => {
			const existing = `# Changelog

## v1.0.0

Old content`;

			const newContent = `# Changelog - updated

## v2.0.0

New content`;

			const result = versionUtils.mergeChangelogRanges(existing, newContent, "abc123", "v2.0.0");

			expect(result).toContain("# Changelog - updated");
			expect(result).not.toContain("# Changelog\n");
		});
	});
});
