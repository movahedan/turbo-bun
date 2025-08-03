type VersionType = "patch" | "minor" | "major";
export type VersionPackages = Record<string, VersionType>;

interface ChangesetEntry {
	packages: VersionPackages;
	summary: string;
}

export const parseChangeset = async (filename: string): Promise<ChangesetEntry> => {
	const packages: VersionPackages = {};
	let summary = "";
	let inSummary = false;

	const lines = (await Bun.file(filename).text()).split("\n").filter(Boolean);
	lines.forEach((line) => {
		if (line.startsWith('"') && line.includes('":')) {
			// Package line
			const match = line.match(/"([^"]+)":\s*(patch|minor|major)/);
			if (match) {
				packages[match[1]] = match[2] as VersionType;
			}
		} else if (line === "---") {
			inSummary = !inSummary;
		} else if (inSummary && line.trim()) {
			summary += `${line}\n`;
		}
	});
	summary = summary.trim();

	return { packages, summary };
};
