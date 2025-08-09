import { $ } from "bun";
import { ChangelogGenerator } from "./changelog-generator";
import { repoUtils } from "./repo-utils";

export interface CommitInfo {
	readonly hash: string;
	readonly author?: string;
	readonly date?: string;
	readonly message: string;
	readonly body?: string;
	readonly isMerge?: boolean;
	readonly prNumber?: string;
	readonly prCommits?: CommitInfo[];
	readonly prCategory?: PRCategory;
	readonly prStats?: PRStats;
}

export interface ParsedCommit {
	readonly type: string;
	readonly scope?: string;
	readonly description: string;
	readonly breaking: boolean;
}

export interface ChangelogEntry extends ParsedCommit {
	readonly hash: string;
	readonly author?: string;
	readonly body?: string;
	readonly isMerge?: boolean;
	readonly prNumber?: string;
	readonly prCommits?: CommitInfo[];
	readonly prCategory?: PRCategory;
	readonly prStats?: PRStats;
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

export type VersionBumpType = "major" | "minor" | "patch";

export class VersionUtils {
	private extractPRNumber(mergeMessage: string): string | undefined {
		const prMatch = mergeMessage.match(/Merge pull request #(\d+)/);
		return prMatch ? prMatch[1] : undefined;
	}

	private async getPRCommits(mergeCommitHash: string): Promise<CommitInfo[]> {
		try {
			const result =
				await $`git log --pretty=format:"%H|%s" ${mergeCommitHash}^..${mergeCommitHash}^2`
					.quiet()
					.nothrow();

			if (result.exitCode !== 0) return [];

			return result
				.text()
				.trim()
				.split("\n")
				.filter(Boolean)
				.map((line) => {
					const [hash, message] = line.split("|");
					return {
						hash: hash?.trim() || "",
						message: message?.trim() || "",
					};
				})
				.filter((commit) => commit.hash && commit.message);
		} catch {
			return [];
		}
	}

	private categorizePR(prCommits: CommitInfo[], mergeMessage: string, prBody?: string): PRCategory {
		if (
			mergeMessage.includes("renovate") ||
			mergeMessage.includes("dependabot") ||
			prBody?.toLowerCase().includes("dependency")
		) {
			return "dependencies";
		}

		const scores = {
			features: 0,
			bugfixes: 0,
			dependencies: 0,
			infrastructure: 0,
			documentation: 0,
			refactoring: 0,
		};

		for (const commit of prCommits) {
			const parsed = this.parseCommit(commit.message);

			switch (parsed.type) {
				case "feat":
					scores.features += 3;
					break;
				case "fix":
					scores.bugfixes += 2;
					break;
				case "deps":
				case "chore":
					if (
						commit.message.includes("dep") ||
						commit.message.includes("update") ||
						commit.message.includes("upgrade")
					) {
						scores.dependencies += 5;
					} else if (
						commit.message.includes("ci") ||
						commit.message.includes("build") ||
						commit.message.includes("workflow")
					) {
						scores.infrastructure += 2;
					}
					break;
				case "docs":
					scores.documentation += 2;
					break;
				case "refactor":
				case "style":
				case "perf":
					scores.refactoring += 2;
					break;
				case "ci":
				case "build":
					scores.infrastructure += 3;
					break;
			}
		}

		const maxScore = Math.max(...Object.values(scores));
		if (maxScore === 0) return "other";

		const winner = Object.entries(scores).find(([_, score]) => score === maxScore);
		return winner ? (winner[0] as PRCategory) : "other";
	}

	private getPRStats(prCommits: CommitInfo[]): PRStats {
		return {
			commitCount: prCommits.length,
		};
	}

	async getCommitsForPackage(
		packageName: string,
		from: string,
		to = "HEAD",
		includeAuthorAndDate = false,
	): Promise<CommitInfo[]> {
		const packagePath = repoUtils.packageJson(packageName).getDir();
		const gitRange = from === "0.0.0" ? to : `${from}..${to}`;

		try {
			const format = includeAuthorAndDate ? "%H|%an|%ad|%s" : "%H|%s";

			let result: Awaited<ReturnType<typeof $>>;
			if (packageName === "root") {
				const allCommits =
					await $`git log ${gitRange} --oneline --pretty=format:"${format}" ${includeAuthorAndDate ? "--date=iso" : ""}`
						.quiet()
						.nothrow();

				if (allCommits.exitCode !== 0) {
					return [];
				}

				const rootCommits =
					await $`git log ${gitRange} --oneline --pretty=format:"${format}" ${includeAuthorAndDate ? "--date=iso" : ""} -- . ":(exclude)apps/*" ":(exclude)packages/*"`
						.quiet()
						.nothrow();

				const mergeCommits =
					await $`git log ${gitRange} --oneline --merges --pretty=format:"${format}" ${includeAuthorAndDate ? "--date=iso" : ""}`
						.quiet()
						.nothrow();

				const allLines = allCommits.text().trim().split("\n").filter(Boolean);
				const rootLines = new Set(
					rootCommits.exitCode === 0 ? rootCommits.text().trim().split("\n").filter(Boolean) : [],
				);
				const mergeLines = new Set(
					mergeCommits.exitCode === 0 ? mergeCommits.text().trim().split("\n").filter(Boolean) : [],
				);

				const filteredLines = allLines.filter((line) => {
					return rootLines.has(line) || mergeLines.has(line);
				});

				const textResult = filteredLines.join("\n");
				const resultBuffer = Buffer.from(textResult);
				result = {
					exitCode: 0,
					stdout: resultBuffer,
					stderr: Buffer.from(""),
					text: () => textResult,
					json: () => JSON.parse(textResult),
					arrayBuffer: () => resultBuffer.buffer,
					blob: () => new Blob([textResult]),
					bytes: () => new Uint8Array(resultBuffer),
				};
			} else {
				const allCommits =
					await $`git log ${gitRange} --oneline --pretty=format:"${format}" ${includeAuthorAndDate ? "--date=iso" : ""}`
						.quiet()
						.nothrow();

				if (allCommits.exitCode !== 0) {
					return [];
				}

				const packageCommits =
					await $`git log ${gitRange} --oneline --pretty=format:"${format}" ${includeAuthorAndDate ? "--date=iso" : ""} -- ${packagePath}`
						.quiet()
						.nothrow();

				const mergeCommits =
					await $`git log ${gitRange} --oneline --merges --pretty=format:"${format}" ${includeAuthorAndDate ? "--date=iso" : ""}`
						.quiet()
						.nothrow();

				const allLines = allCommits.text().trim().split("\n").filter(Boolean);
				const packageLines = new Set(
					packageCommits.exitCode === 0
						? packageCommits.text().trim().split("\n").filter(Boolean)
						: [],
				);
				const mergeLines = new Set(
					mergeCommits.exitCode === 0 ? mergeCommits.text().trim().split("\n").filter(Boolean) : [],
				);

				const relevantMergeLines = new Set<string>();
				for (const mergeLine of mergeLines) {
					const [hash] = mergeLine.split("|");
					if (hash) {
						const prCommitsResult =
							await $`git log --pretty=format:"${format}" ${includeAuthorAndDate ? "--date=iso" : ""} ${hash}^..${hash}^2 -- ${packagePath}`
								.quiet()
								.nothrow();

						if (prCommitsResult.exitCode === 0 && prCommitsResult.text().trim()) {
							relevantMergeLines.add(mergeLine);
						}
					}
				}

				const filteredLines = allLines.filter((line) => {
					return packageLines.has(line) || relevantMergeLines.has(line);
				});

				const textResult = filteredLines.join("\n");
				const resultBuffer = Buffer.from(textResult);
				result = {
					exitCode: 0,
					stdout: resultBuffer,
					stderr: Buffer.from(""),
					text: () => textResult,
					json: () => JSON.parse(textResult),
					arrayBuffer: () => resultBuffer.buffer,
					blob: () => new Blob([textResult]),
					bytes: () => new Uint8Array(resultBuffer),
				};
			}

			if (result.exitCode !== 0 || !result.text().trim()) {
				return [];
			}

			const commitList = result.text().trim().split("\n").filter(Boolean);
			const commits = commitList
				.map((line) => {
					if (includeAuthorAndDate) {
						const [hash, author, date, message] = line.split("|");
						return {
							hash: hash?.trim() || "",
							author: author?.trim() || "",
							date: date?.trim() || "",
							message: message?.trim() || "",
						};
					}

					const [hash, message] = line.split("|");
					return {
						hash: hash?.trim() || "",
						message: message?.trim() || "",
					};
				})
				.filter((commit) => commit.hash && commit.message);

			const enhancedCommits = await Promise.all(
				commits.map(async (commit) => {
					const isMerge =
						commit.message.startsWith("Merge pull request") ||
						commit.message.startsWith("Merge branch");

					if (isMerge) {
						try {
							const bodyResult = await $`git show --format="%B" --no-patch ${commit.hash}`
								.quiet()
								.nothrow();
							if (bodyResult.exitCode === 0) {
								const fullBody = bodyResult.text().trim();
								const lines = fullBody.split("\n");
								const body = lines.slice(1).join("\n").trim();

								const prNumber = this.extractPRNumber(commit.message);
								let prCommits: CommitInfo[] = [];
								let prCategory: PRCategory | undefined;
								let prStats: PRStats | undefined;

								if (prNumber && commit.message.startsWith("Merge pull request")) {
									prCommits = await this.getPRCommits(commit.hash);
									prCategory = this.categorizePR(prCommits, commit.message, body);
									prStats = this.getPRStats(prCommits);
								}

								return {
									...commit,
									body: body || undefined,
									isMerge: true,
									prNumber,
									prCommits: prCommits.length > 0 ? prCommits : undefined,
									prCategory,
									prStats,
								};
							}
						} catch {
							// If we can't get the body, just mark as merge
						}

						return {
							...commit,
							isMerge: true,
						};
					}

					return commit;
				}),
			);

			return enhancedCommits;
		} catch {
			return [];
		}
	}

	private parseCommit(message: string): ParsedCommit {
		const conventionalCommitRegex = /^(\w+!?)(?:\(([^)]+)\))?: (.+)$/;
		const match = message.match(conventionalCommitRegex);

		if (!match) {
			return {
				type: "other",
				description: message,
				breaking: false,
			};
		}

		const [, rawType, scope, description] = match;
		const breaking =
			message.includes("BREAKING CHANGE:") || message.includes("!:") || rawType.endsWith("!");
		const type = rawType.endsWith("!") ? rawType.slice(0, -1) : rawType;

		return {
			type,
			scope,
			description,
			breaking,
		};
	}

	getNextVersion(currentVersion: string, bumpType: VersionBumpType): string {
		const [major, minor, patch] = currentVersion.split(".").map(Number);

		if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
			throw new Error(`Invalid version: ${currentVersion} for bump type: ${bumpType}`);
		}

		switch (bumpType) {
			case "major":
				return `${major + 1}.0.0`;
			case "minor":
				return `${major}.${minor + 1}.0`;
			case "patch":
				return `${major}.${minor}.${patch + 1}`;
			default:
				throw new Error(`Invalid bump type: ${bumpType}`);
		}
	}

	async detectBumpType(
		packageName: string,
		fromVersion?: string,
		toVersion?: string,
	): Promise<VersionBumpType | undefined> {
		const from = await repoUtils.tags.baseTagSha(fromVersion);
		const to = toVersion || "HEAD";
		const commits = await this.getCommitsForPackage(packageName, from, to);

		if (!commits.length) {
			return undefined;
		}

		let hasBreaking = false;
		let hasFeatures = false;
		let hasFixes = false;

		for (const commit of commits) {
			const parsed = this.parseCommit(commit.message);

			if (parsed.breaking) {
				hasBreaking = true;
			} else if (parsed.type === "feat") {
				hasFeatures = true;
			} else if (parsed.type === "fix") {
				hasFixes = true;
			}
		}

		if (hasBreaking) return "major";
		if (hasFeatures) return "minor";
		if (hasFixes) return "patch";
		return "patch";
	}

	parseCommitToChangelogEntry(commit: CommitInfo): ChangelogEntry {
		const parsed = this.parseCommit(commit.message);
		return {
			...parsed,
			hash: commit.hash.substring(0, 7),
			author: commit.author,
			body: commit.body,
			isMerge: commit.isMerge,
			prNumber: commit.prNumber,
			prCommits: commit.prCommits,
			prCategory: commit.prCategory,
			prStats: commit.prStats,
		};
	}

	async generateChangelogContent(
		entries: readonly ChangelogEntry[],
		to = "HEAD",
		repositoryUrl?: string,
		packageName?: string,
	): Promise<string> {
		const displayVersion = to === "HEAD" ? "Unreleased" : to;
		const generator = new ChangelogGenerator();

		return await generator.generateContent(entries, {
			repositoryUrl,
			packageName,
			displayVersion,
		});
	}

	mergeChangelogRanges(
		existing: string,
		newContent: string,
		fromSha: string,
		toSha: string,
	): string {
		const existingVersions = this.parseChangelogVersions(existing);
		const newVersions = this.parseChangelogVersions(newContent);

		const rangeKey = `${fromSha}..${toSha}`;
		console.log(`📝 Updating changelog range: ${rangeKey}`);

		const mergedVersions = new Map(existingVersions);
		for (const [version, content] of newVersions) {
			mergedVersions.set(version, content);
			console.log(`✏️  Updated version: ${version}`);
		}

		const newHeader = this.extractHeader(newContent);
		return this.reconstructChangelogWithHeader(newHeader, mergedVersions);
	}

	private parseChangelogVersions(changelog: string): Map<string, string> {
		const versions = new Map<string, string>();
		const lines = changelog.split("\n");
		const headerEnd = lines.findIndex((line, i) => i > 0 && line.startsWith("## "));

		if (headerEnd === -1) return versions;

		let currentVersion = "";
		let currentContent: string[] = [];

		for (let i = headerEnd; i < lines.length; i++) {
			const line = lines[i];

			if (line.startsWith("## ") && line.match(/## v?\d+\.\d+\.\d+/)) {
				if (currentVersion) {
					versions.set(currentVersion, currentContent.join("\n"));
				}
				currentVersion = line;
				currentContent = [line];
			} else {
				currentContent.push(line);
			}
		}

		if (currentVersion) {
			versions.set(currentVersion, currentContent.join("\n"));
		}

		return versions;
	}

	private extractHeader(changelog: string): string {
		const lines = changelog.split("\n");
		const headerEnd = lines.findIndex((line, i) => i > 0 && line.startsWith("## "));

		const defaultHeader = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).`;

		if (headerEnd === -1) return defaultHeader;
		return lines.slice(0, headerEnd).join("\n").replace(/\n+$/, "");
	}

	private reconstructChangelogWithHeader(header: string, versions: Map<string, string>): string {
		const sortedVersions = Array.from(versions.entries())
			.sort(([a], [b]) => this.compareVersionHeaders(a, b))
			.map(([_, content]) => content.replace(/\n+$/, ""));
		const versionContent = sortedVersions.join("\n\n");

		return `${header}\n\n${versionContent}`;
	}

	private compareVersionHeaders(a: string, b: string): number {
		const extractVersion = (header: string) => {
			if (header.includes("Unreleased")) return "Unreleased";
			const match = header.match(/## (v?\d+\.\d+\.\d+)/);
			if (!match) return "";
			return match[1];
		};

		const versionA = extractVersion(a);
		const versionB = extractVersion(b);

		if (versionA === "Unreleased") return -1;
		if (versionB === "Unreleased") return 1;

		const parseVersion = (version: string) => {
			const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)/);
			if (!match) return [0, 0, 0];
			return [Number.parseInt(match[1]), Number.parseInt(match[2]), Number.parseInt(match[3])];
		};

		const [majorA, minorA, patchA] = parseVersion(versionA);
		const [majorB, minorB, patchB] = parseVersion(versionB);

		if (majorA !== majorB) return majorB - majorA;
		if (minorA !== minorB) return minorB - minorA;
		return patchB - patchA;
	}
}
