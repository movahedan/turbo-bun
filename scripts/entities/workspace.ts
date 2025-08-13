/** biome-ignore-all lint/complexity/noUselessConstructor: it's a simple util class */
import { $ } from "bun";

export class EntityWorkspace {
	constructor() {}

	static async getAllPackages(): Promise<string[]> {
		const packages: string[] = ["root"];

		const workspaceRootResult = await $`git rev-parse --show-toplevel`;
		const workspaceRoot = workspaceRootResult.text().trim();

		let apps: string[] = [];
		const appsResult = await $`ls ${workspaceRoot}/apps/`.nothrow().quiet();
		if (appsResult.exitCode === 0) {
			apps = appsResult.text().trim().split("\n").filter(Boolean);
		}

		let pkgs: string[] = [];
		const packagesResult = await $`ls ${workspaceRoot}/packages/`.nothrow().quiet();
		if (packagesResult.exitCode === 0) {
			pkgs = packagesResult
				.text()
				.trim()
				.split("\n")
				.filter(Boolean)
				.map((pkg) => `@repo/${pkg}`);
		}

		const filteredPackages = await Promise.all(
			[...apps, ...pkgs].map(async (pkg) => {
				const packageJsonPath = EntityWorkspace.getPackageJsonPath(pkg);
				const exists = await Bun.file(packageJsonPath).exists();

				if (!exists) return null;

				try {
					const packageJson = await Bun.file(packageJsonPath).json();
					const name = packageJson.name;

					if (!name) return null;

					if (name !== pkg) {
						throw new Error(`Package ${pkg} has a different name in package.json: ${name}`);
					}

					return name;
				} catch {
					return null;
				}
			}),
		);

		packages.push(...filteredPackages.filter((pkg): pkg is string => pkg !== null));

		return packages;
	}

	static getPackagePath(packageName: string): string {
		if (packageName === "root") return ".";
		if (packageName.startsWith("@repo/")) return `packages/${packageName.replace("@repo/", "")}`;
		return `apps/${packageName}`;
	}

	static getPackageJsonPath(packageName: string): string {
		return `${EntityWorkspace.getPackagePath(packageName)}/package.json`;
	}

	static async validatePackage(packageName: string): Promise<boolean> {
		try {
			const packageJsonPath = EntityWorkspace.getPackageJsonPath(packageName);
			const exists = await Bun.file(packageJsonPath).exists();

			if (!exists) return false;

			const packageJson = await Bun.file(packageJsonPath).json();
			return packageJson.name === packageName;
		} catch {
			return false;
		}
	}

	static async getPackageInfo(packageName: string): Promise<{
		name: string;
		version: string;
		path: string;
		packageJsonPath: string;
	} | null> {
		try {
			const path = EntityWorkspace.getPackagePath(packageName);
			const packageJsonPath = EntityWorkspace.getPackageJsonPath(packageName);

			const exists = await Bun.file(packageJsonPath).exists();
			if (!exists) return null;

			const packageJson = await Bun.file(packageJsonPath).json();

			return {
				name: packageJson.name,
				version: packageJson.version || "0.0.0",
				path,
				packageJsonPath,
			};
		} catch {
			return null;
		}
	}
}
