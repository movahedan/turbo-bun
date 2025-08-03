import fs from "node:fs";
import path from "node:path";

const filterPackages = (dir: string) =>
	fs
		.readdirSync(dir)
		.filter(
			(pkg) =>
				!pkg.startsWith(".") &&
				fs.statSync(path.join(dir, pkg)).isDirectory() &&
				fs.statSync(path.join(dir, pkg, "package.json")).isFile(),
		);

interface Directory {
	name: string;
	path: string;
}

export function getAllDirectories(baseDir: string): Directory[] {
	const directories: Directory[] = [{ name: "root", path: "." }];

	const appsDir = path.join(baseDir, "apps");
	if (fs.existsSync(appsDir)) {
		const apps = filterPackages(appsDir);
		for (const app of apps) {
			directories.push({ name: app, path: `apps/${app}` });
		}
	}

	const packagesDir = path.join(baseDir, "packages");
	if (fs.existsSync(packagesDir)) {
		const packages = filterPackages(packagesDir);
		for (const pkg of packages) {
			directories.push({ name: `@repo/${pkg}`, path: `packages/${pkg}` });
		}
	}

	return directories;
}
