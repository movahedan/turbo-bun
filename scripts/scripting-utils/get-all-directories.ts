import { readdir } from "node:fs/promises";
import path from "node:path";

const filterPackages = async (dir: string) => {
	const entries = await readdir(dir);
	const packages = [];

	for (const entry of entries) {
		if (entry.startsWith(".")) continue;

		const entryPath = path.join(dir, entry);
		const stat = await Bun.file(entryPath).stat();

		if (stat.isDirectory()) {
			const packageJsonPath = path.join(entryPath, "package.json");
			if (await Bun.file(packageJsonPath).exists()) {
				packages.push(entry);
			}
		}
	}

	return packages;
};

interface Directory {
	name: string;
	path: string;
}

export async function getAllDirectories(baseDir: string): Promise<Directory[]> {
	const directories: Directory[] = [{ name: "root", path: "." }];

	const appsDir = path.join(baseDir, "apps");
	if (await Bun.file(appsDir).exists()) {
		const apps = await filterPackages(appsDir);
		for (const app of apps) {
			directories.push({ name: app, path: `apps/${app}` });
		}
	}

	const packagesDir = path.join(baseDir, "packages");
	if (await Bun.file(packagesDir).exists()) {
		const packages = await filterPackages(packagesDir);
		for (const pkg of packages) {
			directories.push({ name: `@repo/${pkg}`, path: `packages/${pkg}` });
		}
	}

	return directories;
}
