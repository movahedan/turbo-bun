import fs from "node:fs";
import path from "node:path";

export function getAllDirectories(
	baseDir: string,
): { name: string; path: string }[] {
	const directories: { name: string; path: string }[] = [
		{ name: "root", path: "." },
	];

	const appsDir = path.join(baseDir, "apps");
	if (fs.existsSync(appsDir)) {
		const apps = fs.readdirSync(appsDir);
		for (const app of apps) {
			directories.push({ name: app, path: `apps/${app}` });
		}
	}

	const packagesDir = path.join(baseDir, "packages");
	if (fs.existsSync(packagesDir)) {
		const packages = fs.readdirSync(packagesDir);
		for (const pkg of packages) {
			directories.push({ name: pkg, path: `packages/${pkg}` });
		}
	}

	return directories;
}
