/** biome-ignore-all lint/complexity/noUselessConstructor: it's a simple util class */
import { $ } from "bun";
import { EntityCompose } from "./compose";
import { EntityTag } from "./tag";
import { EntityWorkspace } from "./workspace";

export interface AffectedService {
	readonly name: string;
	readonly environment: "dev" | "prod";
	readonly port?: number;
}

export class EntityAffected {
	constructor() {}

	static async getAffectedPackages(baseSha?: string, to = "HEAD"): Promise<string[]> {
		const fromSha = await EntityTag.getBaseTagSha(baseSha);

		const affected = await $`bunx turbo run build --filter="...[${fromSha}...${to}]" --dry-run=json`
			.quiet()
			.json();

		return affected.packages.slice(1);
	}

	static async getAffectedServices(
		baseSha?: string,
		to = "HEAD",
		composeMode: "dev" | "prod" | "all" = "prod",
	): Promise<AffectedService[]> {
		try {
			const keys = await EntityAffected.getAffectedPackages(baseSha, to);
			const devServices = await EntityCompose.parse("dev");
			const prodServices = await EntityCompose.parse("prod");
			const allPackages = await EntityWorkspace.getAllPackages();

			const serviceMap = new Map<string, AffectedService>();
			const affectedServices = new Set<string>();

			const services =
				composeMode === "all"
					? [...devServices.exposedServices(), ...prodServices.exposedServices()]
					: composeMode === "dev"
						? devServices.exposedServices()
						: prodServices.exposedServices();

			for (const service of services) {
				const serviceKey = allPackages.find((p) => p.includes(service.name));
				if (keys.some((k: string) => k === serviceKey)) {
					affectedServices.add(service.name);
					const environment = composeMode === "all" || composeMode === "dev" ? "dev" : "prod";
					serviceMap.set(service.name, {
						name: service.name,
						environment,
						port: service.port,
					});

					if (service.dependencies) {
						for (const dep of service.dependencies) {
							affectedServices.add(dep);
						}
					}
				}
			}

			for (const serviceName of affectedServices) {
				if (!serviceMap.has(serviceName)) {
					const devService = devServices.exposedServices().find((s) => s.name === serviceName);
					if (devService) {
						serviceMap.set(serviceName, {
							name: devService.name,
							environment: "dev",
							port: devService.port,
						});
					}

					const prodService = prodServices.exposedServices().find((s) => s.name === serviceName);
					if (prodService) {
						serviceMap.set(serviceName, {
							name: prodService.name,
							environment: "prod",
							port: prodService.port,
						});
					}
				}
			}

			return Array.from(serviceMap.values());
		} catch (error) {
			throw new Error(`Failed to get affected services: ${error}`);
		}
	}
}
