import type { ParsedCommitData } from "../commit";
import { EntityPackages } from "../packages";
import { EntityTag } from "../tag";
import type { ChangelogData } from "./types";

export interface TemplateEngine {
	generateContent(data: ChangelogData): string;
	parseVersions(content: string): ChangelogData;
	sortVersions(versionA: string, versionB: string): number;
}
export type TemplateEngineData = ChangelogData;

const prefix = EntityTag.getPrefix();
const repoUrl = await EntityPackages.getRepoUrl();

export class ChangelogTemplate implements TemplateEngine {
	readonly packageName: string;

	constructor(packageName: string) {
		this.packageName = packageName;
	}

	generateContent(changelogData: TemplateEngineData): string {
		let changelog = ChangelogTemplate.getChangelogHeader(this.packageName);
		const sortedVersions = Object.keys(changelogData).sort((a, b) => this.sortVersions(b, a));

		for (const version of sortedVersions) {
			const versionData = changelogData.get(version);
			if (typeof versionData === "string") {
				changelog += versionData;
				continue;
			}

			const versionHeader = ChangelogTemplate.getChangelogVersionHeader(version);
			changelog += versionHeader;

			for (const commit of versionData?.mergeCommits || []) {
				if (commit.pr?.prNumber) {
					changelog += ChangelogTemplate.formatPRSection(
						commit,
						commit.pr.prCommits || [commit],
						repoUrl,
					);
				}
			}

			changelog += ChangelogTemplate.formatOrphanCommits(versionData?.orphanCommits || [], repoUrl);
		}

		return changelog;
	}

	parseVersions(content: string): TemplateEngineData {
		const versions: TemplateEngineData = new Map();
		const lines = content.split("\n");
		const headerEnd = lines.findIndex((line, i) => i > 0 && line.startsWith("## "));

		if (headerEnd === -1) return versions;

		let currentVersion = "";
		let currentContent: string[] = [];

		for (let i = headerEnd; i < lines.length; i++) {
			const line = lines[i];
			const isVersionLine =
				line.match(/## \[Unreleased\]/) ||
				line.match(new RegExp(`^## ${prefix}?\\d+\\.\\d+\\.\\d+`));

			if (isVersionLine) {
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

	sortVersions(a: string, b: string): number {
		if (a.includes("[Unreleased]")) return -1;
		if (b.includes("[Unreleased]")) return 1;

		const extractVersion = (header: string) => {
			const match = header.match(/## (?:\[)?(v?\d+\.\d+\.\d+)(?:\])?/);
			if (!match) return "";
			return match[1];
		};

		const versionA = extractVersion(a);
		const versionB = extractVersion(b);

		return versionA.localeCompare(versionB);
	}

	protected static getChangelogHeader(_packageName: string): string {
		return "";
	}

	protected static getChangelogVersionHeader(_version: string): string {
		return "";
	}

	protected static formatPRSection(
		_commit: ParsedCommitData,
		_allCommits: ParsedCommitData[],
		_repoUrl: string,
	): string {
		return "";
	}

	protected static formatOrphanCommits(_commits: ParsedCommitData[], _repoUrl: string): string {
		return "";
	}

	protected static getOrphanHeader() {
		return "";
	}
}
