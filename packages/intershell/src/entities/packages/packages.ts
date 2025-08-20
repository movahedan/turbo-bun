import { $ } from "bun";
import type {
	PackageDependencyGraph,
	PackageJson,
	PackageValidationError,
	PackageValidationResult,
} from "./types";

export class EntityPackages {
	private readonly packageName: string;
	private readonly packageJson: Promise<PackageJson>;
	constructor(packageName: string) {
		this.packageName = packageName;
		this.packageJson = this.readJson();
	}

	getPath(): string {
		if (this.packageName === "root") return ".";
		if (this.packageName.startsWith("@repo/"))
			return `packages/${this.packageName.replace("@repo/", "")}`;
		return `apps/${this.packageName}`;
	}
	getJsonPath(): string {
		return `${this.getPath()}/package.json`;
	}
	getChangelogPath(): string {
		return `${this.getPath()}/CHANGELOG.md`;
	}

	async readJson(): Promise<PackageJson> {
		return Bun.file(this.getJsonPath())
			.json()
			.catch(() => {
				throw new Error(`Package not found ${this.packageName} at ${this.getJsonPath()}`);
			});
	}
	async writeJson(data: PackageJson): Promise<void> {
		await Bun.write(this.getJsonPath(), JSON.stringify(data, null, 2));
	}
	async readVersion(): Promise<string> {
		return (await this.packageJson).version;
	}
	async writeVersion(version: string): Promise<void> {
		const packageJson = await this.packageJson;
		packageJson.version = version;
		await this.writeJson(packageJson);
	}
	async readChangelog(): Promise<string> {
		return Bun.file(this.getChangelogPath())
			.text()
			.catch(() => {
				throw new Error(`Changelog not found ${this.packageName} at ${this.getChangelogPath()}`);
			});
	}
	async writeChangelog(content: string): Promise<void> {
		await Bun.write(this.getChangelogPath(), content);
	}

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
				const packageInstance = new EntityPackages(pkg);
				const packageJsonPath = packageInstance.getJsonPath();
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
	static async validatePackage(packageName: string): Promise<PackageValidationResult> {
		const packageInstance = new EntityPackages(packageName);
		const packageJson = await packageInstance.readJson();

		const errors: PackageValidationError[] = [];

		if (!/^\d+\.\d+\.\d+/.test(packageJson.version)) {
			errors.push({
				code: "INVALID_VERSION",
				message: "Version should follow semantic versioning",
				field: "version",
			});
		}

		if (!packageJson.description) {
			errors.push({
				code: "MISSING_DESCRIPTION",
				message: "Consider adding a description to package.json",
				field: "description",
			});
		}

		const graph = await EntityPackages.getPackagesGraph();
		const cycles = graph.cycles;
		if (cycles.length > 0) {
			errors.push({
				code: "CYCLIC_DEPENDENCIES",
				message: "Cyclic dependencies found",
				field: "dependencies",
			});
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}
	static async getRepoUrl(): Promise<string> {
		const rootPackageInstance = new EntityPackages("root");
		const rootPackageJson = await rootPackageInstance.readJson();
		return typeof rootPackageJson.repository === "string"
			? rootPackageJson.repository
			: rootPackageJson.repository?.url || "";
	}
	private static async getPackagesGraph(): Promise<PackageDependencyGraph> {
		const packageNames = await EntityPackages.getAllPackages();

		const dependencies: Record<string, string[]> = {};
		const devDependencies: Record<string, string[]> = {};
		const peerDependencies: Record<string, string[]> = {};

		for (const pkg of packageNames) {
			const packageInstance = new EntityPackages(pkg);
			const packageJson = await packageInstance.packageJson;

			dependencies[pkg] = Object.keys(packageJson.dependencies || {});
			devDependencies[pkg] = Object.keys(packageJson.devDependencies || {});
			peerDependencies[pkg] = Object.keys(packageJson.peerDependencies || {});
		}

		return {
			packages: packageNames,
			dependencies,
			devDependencies,
			peerDependencies,
			order: EntityPackages.topologicalSort(packageNames, dependencies),
			cycles: [],
		};
	}
	private static topologicalSort(
		packages: string[],
		dependencies: Record<string, string[]>,
	): string[] {
		const visited = new Set<string>();
		const result: string[] = [];

		const visit = (pkg: string) => {
			if (visited.has(pkg)) return;
			visited.add(pkg);

			const deps = dependencies[pkg] || [];
			for (const dep of deps) {
				if (packages.includes(dep)) {
					visit(dep);
				}
			}

			result.push(pkg);
		};

		for (const pkg of packages) {
			visit(pkg);
		}

		return result;
	}
}
