import path, { join } from "node:path";
import { $ } from "bun";
import type { PackageJson } from "type-fest";
// waiting for https://github.com/oven-sh/bun/issues/1003
import { parse as pYaml } from "yaml";
import { VersionUtils } from "./version-utils";

// PackageJsonUtils -------------------------------------------------------------------------------
class PackageJsonUtils {
	packageName: string;
	jsonPath: string;
	jsonFile: ReturnType<typeof Bun.file>;

	constructor(packageName: string) {
		this.packageName = packageName;
		this.jsonPath = `${this.getDir()}/package.json`;
		this.jsonFile = Bun.file(this.jsonPath);
	}

	getDir(): string {
		if (this.packageName === "root") return ".";
		if (this.packageName.startsWith("@repo/"))
			return `packages/${this.packageName.replace("@repo/", "")}`;
		return `apps/${this.packageName}`;
	}

	getPath(): string {
		return this.jsonPath;
	}

	async get(): Promise<PackageJson> {
		return await this.jsonFile.json();
	}

	async set(content: PackageJson): Promise<void> {
		await this.jsonFile.write(JSON.stringify(content, null, 2));
		await $`bun biome check --write --no-errors-on-unmatched ${this.jsonPath}`;
	}

	async bump(newVersion: string): Promise<void> {
		const content = await this.get();
		content.version = newVersion;
		await this.set(content);
	}

	async version(): Promise<string> {
		const content = await this.get();
		return content.version ?? "0.0.0";
	}

	async getChangelogPath(): Promise<string> {
		if (this.packageName === "root") return "CHANGELOG.md";
		if (this.packageName.startsWith("@repo/"))
			return path.join("packages", this.packageName.replace("@repo/", ""), "CHANGELOG.md");
		return path.join("apps", this.packageName, "CHANGELOG.md");
	}

	async writeChangelog(newChangelog: string, fromSha: string, toSha: string): Promise<string> {
		const path = await this.getChangelogPath();
		const file = Bun.file(path);
		const exists = await file.exists();

		if (!exists) {
			await Bun.write(path, newChangelog);
			return path;
		}

		const existingContent = await file.text();
		const versionUtils = new VersionUtils();
		const updatedChangelog = versionUtils.mergeChangelogRanges(
			existingContent,
			newChangelog,
			fromSha,
			toSha,
		);
		await Bun.write(path, updatedChangelog);
		return path;
	}
}

// WorkspaceUtils ---------------------------------------------------------------------------------
class WorkspaceUtils {
	baseDir: string = join(import.meta.dir, "../..");

	async getAllPackages(): Promise<string[]> {
		const packages: string[] = ["root"];

		let apps: string[] = [];
		const appsResult = await $`ls apps/`.nothrow().quiet();
		if (appsResult.exitCode === 0) {
			apps = appsResult.text().trim().split("\n").filter(Boolean);
		}

		let pkgs: string[] = [];
		const packagesResult = await $`ls packages/`.nothrow().quiet();
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
				const packageJson = repoUtils.packageJson(pkg);
				const exists = await packageJson.jsonFile.exists();

				const name = exists ? (await packageJson.get()).name : null;
				if (!name) return null;

				if (name !== pkg) {
					throw new Error(`Package ${pkg} has a different name in package.json: ${name}`);
				}

				return name;
			}),
		);
		packages.push(...filteredPackages.filter((pkg): pkg is string => pkg !== null));

		return packages;
	}
}

// AffectedUtils ----------------------------------------------------------------------------------
export interface ServiceInfo {
	name: string;
	port?: number;
	hostPort?: number;
	containerPort?: number;
	environment?: Record<string, string>;
	dependencies?: string[];
	healthcheck?: {
		test: string[];
		interval?: string;
		timeout?: string;
		retries?: number;
		start_period?: string;
	};
}

export interface ServiceHealth {
	name: string;
	status: "healthy" | "unhealthy" | "starting" | "none";
	port?: string;
}

interface DockerCompose {
	name?: string;
	services: Record<
		string,
		{
			ports?: string[];
			environment?: Record<string, string>;
			depends_on?: string[];
			healthcheck?: {
				test: string[];
				interval?: string;
				timeout?: string;
				retries?: number;
				start_period?: string;
			};
		}
	>;
}

interface AffectedService {
	name: string;
	environment: "dev" | "prod";
	port?: number;
}

class AffectedUtils {
	baseSha: Promise<string>;
	affectMode: "version" | "commit" = "commit";
	composeMode: "dev" | "prod" | "all" = "prod";

	constructor(
		baseSha?: string,
		affectMode: "version" | "commit" = "commit",
		composeMode: "dev" | "prod" | "all" = "prod",
	) {
		this.affectMode = affectMode;
		this.composeMode = affectMode === "version" ? "prod" : composeMode;
		this.baseSha = Promise.resolve(baseSha?.trim() ?? this.getBaseSha());
	}

	async getBaseSha(): Promise<string> {
		const currentBranch = await $`git branch --show-current`.text();
		const isOnMain = currentBranch.trim() === "main";

		if (!isOnMain) {
			return "origin/main";
		}

		const currentSha = await $`git rev-parse HEAD`.text();
		const parentSha = await $`git rev-parse ${currentSha.trim()}^1`.text();
		return parentSha.trim();
	}

	async packages(to = "HEAD"): Promise<string[]> {
		const baseSha = await this.baseSha;
		const affected = await $`bunx turbo run build --filter="...[${baseSha}...${to}]" --dry-run=json`
			.quiet()
			.json();

		return affected.packages.slice(1);
	}

	async services(
		to = "HEAD",
		composeMode: "dev" | "prod" | "all" = "prod",
	): Promise<AffectedService[]> {
		try {
			const affectedServices = await this.getAffectedServices(to, composeMode);
			const devServices = await repoUtils.compose.parse("dev");
			const prodServices = await repoUtils.compose.parse("prod");

			const allServicesWithDeps = new Set<string>();

			for (const service of affectedServices) {
				allServicesWithDeps.add(service.name);

				const serviceList =
					service.environment === "dev"
						? devServices.exposedServices()
						: prodServices.exposedServices();
				const serviceInfo = serviceList.find((s) => s.name === service.name);
				if (serviceInfo?.dependencies) {
					for (const dep of serviceInfo.dependencies) {
						allServicesWithDeps.add(dep);
					}
				}
			}

			const result: AffectedService[] = [];
			for (const serviceName of allServicesWithDeps) {
				const devService = devServices.exposedServices().find((s) => s.name === serviceName);
				if (devService) {
					result.push({
						name: devService.name,
						environment: "dev",
						port: devService.port,
					});
				}

				const prodService = prodServices.exposedServices().find((s) => s.name === serviceName);
				if (prodService) {
					result.push({
						name: prodService.name,
						environment: "prod",
						port: prodService.port,
					});
				}
			}

			return result;
		} catch (error) {
			throw new Error(`Failed to get affected services with dependencies: ${error}`);
		}
	}

	async getAffectedServices(
		to = "HEAD",
		composeMode: "dev" | "prod" | "all" = "prod",
	): Promise<AffectedService[]> {
		const keys = await this.packages(to);
		const devServices = await repoUtils.compose.parse("dev");
		const prodServices = await repoUtils.compose.parse("prod");
		const allPackages = await repoUtils.workspace.getAllPackages();

		const affectedServices: AffectedService[] = [];

		const services: ServiceInfo[] = [];
		if (composeMode === "all") {
			services.push(...devServices.exposedServices(), ...prodServices.exposedServices());
		} else if (composeMode === "dev") {
			services.push(...devServices.exposedServices());
		} else if (composeMode === "prod") {
			services.push(...prodServices.exposedServices());
		}

		for (const service of services) {
			const serviceKey = allPackages.find((p) => p.includes(service.name));
			if (keys.some((k: string) => k === serviceKey)) {
				affectedServices.push({
					name: service.name,
					environment: "dev",
					port: service.port,
				});
			}
		}

		return affectedServices;
	}
}

// TagsUtils --------------------------------------------------------------------------------------
class TagsUtils {
	prefix = "v";

	toTag(version: string, prefix = this.prefix): string {
		return `${prefix}${version}`;
	}

	async sha(tagName: string): Promise<string> {
		const result = await $`git rev-list -n 1 ${tagName}`.text();
		return result.trim();
	}

	async exists(tagName: string): Promise<boolean> {
		const result = await $`git tag --list "${tagName}"`.text();
		return result.trim() !== "";
	}

	async info(tagName: string): Promise<{ date: string; message: string }> {
		const dateResult = await $`git log -1 --format=%ai ${tagName}`.text();
		const messageResult = await $`git tag -l --format='%(contents:subject)' ${tagName}`
			.quiet()
			.text();

		const date = dateResult.trim().split(" ")[0];
		const message = messageResult.trim();

		return { date, message };
	}

	async firstCommit(): Promise<string> {
		const result = await $`git rev-list --max-parents=0 HEAD`.text();
		return result.trim();
	}

	async baseTag(prefix = this.prefix): Promise<string | undefined> {
		try {
			const result = await $`git tag --list "${prefix}*" --sort=-version:refname`.quiet().nothrow();
			if (result.exitCode !== 0) return undefined;

			const tags = result.text().trim().split("\n").filter(Boolean);
			const tag = tags.length > 0 ? tags[0] : undefined;

			return tag;
		} catch {
			return undefined;
		}
	}

	async baseTagSha(from?: string): Promise<string> {
		if (from) return await this.sha(from);

		const baseTag = await this.baseTag();
		if (baseTag) return await this.sha(baseTag);

		const firstCommit = await $`git rev-list --max-parents=0 HEAD`.text();
		return firstCommit.trim();
	}
}

// ComposeUtils -----------------------------------------------------------------------------------
class ComposeUtils {
	private readonly composePaths = {
		dev: ".devcontainer/docker-compose.dev.yml",
		prod: "docker-compose.yml",
	} as const;

	async parse(mode: "dev" | "prod") {
		const services = await this.parseServices(this.composePaths[mode]);

		return {
			exposedServices: () => services.filter((s) => s.port !== undefined),
			serviceHealth: async () => {
				return $`docker compose -f ${this.composePaths[mode]} --profile all ps`.then(({ stdout }) =>
					this.parseDockerPsOutput(stdout.toString()),
				);
			},
			serviceUrls: (baseUrl = "http://localhost") => {
				return Object.fromEntries(
					services
						.filter((service) => service.port !== undefined)
						.map((service) => [service.name, service.port ? `${baseUrl}:${service.port}` : ""]),
				);
			},
			servicePorts: () =>
				Object.fromEntries(services.map((s) => [s.name, s.port?.toString() ?? ""])),
			dependentServices: (serviceName: string) =>
				services.filter((service) => service.dependencies?.includes(serviceName)),
		};
	}

	private async parseServices(composePath: string): Promise<ServiceInfo[]> {
		try {
			if (!(await Bun.file(composePath).exists())) {
				throw new Error(`Docker compose file not found: ${composePath}`);
			}

			const services: ServiceInfo[] = [];
			const compose: DockerCompose = pYaml(await Bun.file(composePath).text());

			for (const [serviceName, service] of Object.entries(compose.services)) {
				const serviceInfo: ServiceInfo = {
					name: serviceName,
					environment: service.environment,
					dependencies: service.depends_on,
					healthcheck: service.healthcheck,
				};

				if (service.ports && service.ports.length > 0) {
					const portMapping = service.ports[0];

					if (/^\d+$/.test(portMapping)) {
						const port = Number.parseInt(portMapping, 10);
						serviceInfo.hostPort = port;
						serviceInfo.containerPort = port;
						serviceInfo.port = port;
					} else if (/^\d+:\d+$/.test(portMapping)) {
						const [hostPort, containerPort] = portMapping.split(":");
						serviceInfo.hostPort = Number.parseInt(hostPort, 10);
						serviceInfo.containerPort = Number.parseInt(containerPort, 10);
						serviceInfo.port = serviceInfo.hostPort;
					} else {
						console.warn(`Unsupported port format for service ${serviceName}: ${portMapping}`);
					}
				}

				services.push(serviceInfo);
			}

			return services;
		} catch (error) {
			console.error(`Error parsing ${composePath}:`, error);
			return [];
		}
	}

	private parseDockerPsOutput(output: string): ServiceHealth[] {
		const lines = output.trim().split("\n");
		const services: ServiceHealth[] = [];

		for (const line of lines) {
			if (line.includes("NAME") || line.includes("----")) continue;

			const nameMatch = line.match(/^(\S+)/);
			if (!nameMatch) continue;

			const name = nameMatch[1];
			let healthStatus: "healthy" | "unhealthy" | "starting" | "none" = "none";

			if (line.includes("healthy") || line.includes("Up")) {
				healthStatus = "healthy";
			} else if (line.includes("unhealthy")) {
				healthStatus = "unhealthy";
			} else if (line.includes("starting")) {
				healthStatus = "starting";
			}

			const portMatch = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+->\d+)/);
			const port = portMatch ? portMatch[1] : undefined;

			services.push({
				name,
				status: healthStatus,
				port,
			});
		}

		return services;
	}
}

// the main export -------------------------------------------------------------------------------
export const repoUtils = {
	affected: (baseSha?: string) => new AffectedUtils(baseSha),
	compose: new ComposeUtils(),
	packageJson: (packageName: string) => new PackageJsonUtils(packageName),
	tags: new TagsUtils(),
	workspace: new WorkspaceUtils(),
};
