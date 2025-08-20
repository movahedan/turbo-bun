/**
 * Usage examples for the new changelog system
 */

import { EntityTag } from "../tag";
import { EntityChangelog } from "./changelog";
import type { ChangelogTemplate } from "./template";
import { CompactChangelogTemplate } from "./template.compact";
import { DefaultChangelogTemplate } from "./template.default";
import type { ChangelogData } from "./types";

// Example 1: Using the main changelog manager with default template
async function exampleMainChangelog() {
	// Create template engine
	const templateEngine = new DefaultChangelogTemplate("my-package");

	// Create changelog manager
	const changelogManager = new EntityChangelog("my-package", templateEngine);

	// Set commit range
	await changelogManager.setRange("v1.0.0", "HEAD");

	// Generate new changelog content
	const newContent = await changelogManager.generateChangelog();

	// Generate merged changelog with existing content
	const finalContent = await changelogManager.generateMergedChangelog();

	console.log("Generated changelog:", newContent);
	console.log("Final changelog:", finalContent);
}

// Example 2: Using compact template for simplified changelog
async function exampleCompactChangelog() {
	// Create compact template engine
	const templateEngine = new CompactChangelogTemplate("my-package");

	// Create changelog manager
	const changelogManager = new EntityChangelog("my-package", templateEngine);

	// Set commit range
	await changelogManager.setRange("v1.0.0", "HEAD");

	// Generate compact changelog
	const compactContent = await changelogManager.generateChangelog();
	console.log("Compact changelog:", compactContent);
}

// Example 3: Using git tag parser directly
async function exampleGitTagParsing() {
	// Get version history for a package
	const history = await EntityTag.getPackageVersionHistory("my-package");
	console.log("Package version history:", history);

	// Get latest version from git tags
	const latestVersion = await EntityTag.getLatestPackageVersionInHistory("my-package");
	console.log("Latest version:", latestVersion);

	// Check if version exists in git history
	const exists = await EntityTag.packageVersionExistsInHistory("my-package", "1.0.0");
	console.log("Version 1.0.0 exists:", exists);
}

// Example 4: Creating a custom template engine
class CustomTemplateEngine implements ChangelogTemplate {
	readonly packageName: string;

	constructor(packageName: string) {
		this.packageName = packageName;
	}

	generateContent(data: ChangelogData): string {
		let result = `# Custom Changelog for ${this.packageName}\n\n`;

		// Iterate through versions
		for (const [version, versionData] of data) {
			if (typeof versionData === "string") {
				result += versionData;
				continue;
			}

			result += `## Version ${version}\n\n`;
			result += `Merge Commits: ${versionData.mergeCommits.length}\n`;
			result += `Orphan Commits: ${versionData.orphanCommits.length}\n\n`;
		}

		return result;
	}

	parseVersions(_content: string): ChangelogData {
		const versions = new Map<string, string>();
		// Custom parsing logic for custom format
		// This method is used by EntityChangelog for merging
		return versions;
	}

	sortVersions(versionA: string, versionB: string): number {
		// Simple string comparison for custom sorting
		return versionA.localeCompare(versionB);
	}
}

async function exampleCustomTemplate() {
	const customTemplate = new CustomTemplateEngine("my-package");
	const changelogManager = new EntityChangelog("my-package", customTemplate);

	await changelogManager.setRange("v1.0.0", "HEAD");

	// Generate new content using custom template
	const content = await changelogManager.generateChangelog();

	console.log("Custom template changelog:", content);
}

// Example 5: Using different templates for different purposes
async function exampleMultipleTemplates() {
	// Default template for full changelog
	const defaultTemplate = new DefaultChangelogTemplate("my-package");
	const defaultChangelog = new EntityChangelog("my-package", defaultTemplate);
	await defaultChangelog.setRange("v1.0.0", "HEAD");
	const fullChangelog = await defaultChangelog.generateChangelog();

	// Compact template for summary
	const compactTemplate = new CompactChangelogTemplate("my-package");
	const compactChangelog = new EntityChangelog("my-package", compactTemplate);
	await compactChangelog.setRange("v1.0.0", "HEAD");
	const summaryChangelog = await compactChangelog.generateChangelog();

	console.log("Full changelog:", fullChangelog);
	console.log("Summary changelog:", summaryChangelog);
}

export {
	exampleMainChangelog,
	exampleCompactChangelog,
	exampleGitTagParsing,
	exampleCustomTemplate,
	exampleMultipleTemplates,
};
