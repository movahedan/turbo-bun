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

			const affectedServices: AffectedService[] = [];

			const services = devServices.exposedServices();
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
		} catch (error) {
			throw new Error(`Failed to get affected services: ${error}`);
		}
	}

	static async getAffectedServicesWithDependencies(
		baseSha?: string,
		to = "HEAD",
		composeMode: "dev" | "prod" | "all" = "prod",
	): Promise<AffectedService[]> {
		try {
			const affectedServices = await EntityAffected.getAffectedServices(baseSha, to, composeMode);
			const devServices = await EntityCompose.parse("dev");
			const prodServices = await EntityCompose.parse("prod");

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
}
