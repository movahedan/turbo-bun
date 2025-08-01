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
		const apps = fs
			.readdirSync(appsDir)
			.filter(
				(app) =>
					!app.startsWith(".") &&
					fs.statSync(path.join(appsDir, app)).isDirectory(),
			);
		for (const app of apps) {
			directories.push({ name: app, path: `apps/${app}` });
		}
	}

	const packagesDir = path.join(baseDir, "packages");
	if (fs.existsSync(packagesDir)) {
		const packages = fs
			.readdirSync(packagesDir)
			.filter(
				(pkg) =>
					!pkg.startsWith(".") &&
					fs.statSync(path.join(packagesDir, pkg)).isDirectory(),
			);
		for (const pkg of packages) {
			// Convert kebab-case to lowercase for scope names and add @repo/ prefix
			directories.push({ name: `@repo/${pkg}`, path: `packages/${pkg}` });
		}
	}

	return directories;
}
