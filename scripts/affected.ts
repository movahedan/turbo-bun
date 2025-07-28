import { $ } from "bun";
import { getAllServices } from "./utils/docker-compose-parser";

/* Sample output of turbo command:
  {
    ...,
    "packages": [
      "//", // root package
      "@repo/<package-name>", // affected package
    ],
		...
  }
*/
export async function getAffectedPackages(): Promise<string[]> {
	const affectedPackages =
		await $`turbo run build --filter="...[origin/main]" --dry-run=json`
			.quiet()
			.json();

	// Remove root package
	return affectedPackages.packages.slice(1);
}

type ServiceMode = "dev" | "prod" | "all";

export interface AffectedService {
	name: string;
	environment: ServiceMode;
	port?: number;
}

async function getAffectedServices(
	mode: ServiceMode,
): Promise<AffectedService[]> {
	const keys = await getAffectedPackages();
	const allServices = await getAllServices();

	const affectedServices: AffectedService[] = [];

	// Check dev services
	if (mode === "dev" || mode === "all") {
		for (const service of allServices.dev) {
			const serviceKey = service.name === "ui" ? "@repo/ui" : service.name;
			if (keys.some((k: string) => k === serviceKey)) {
				affectedServices.push({
					name: service.name,
					environment: "dev",
					port: service.port,
				});
			}
		}
	}

	// Check prod services
	if (mode === "prod" || mode === "all") {
		for (const service of allServices.prod) {
			const serviceKey = service.name.replace(/^prod-/, "");
			const packageKey = serviceKey === "ui" ? "@repo/ui" : serviceKey;
			if (keys.some((k: string) => k === packageKey)) {
				affectedServices.push({
					name: service.name,
					environment: "prod",
					port: service.port,
				});
			}
		}
	}

	return affectedServices;
}

/**
 * Get affected services with their dependencies
 */
export async function getAffectedServicesWithDependencies(
	mode: "dev" | "prod" | "all",
): Promise<AffectedService[]> {
	const affectedServices = await getAffectedServices(mode);
	const allServices = await getAllServices();

	const allServicesWithDeps = new Set<string>();

	// Add affected services and their dependencies
	for (const service of affectedServices) {
		allServicesWithDeps.add(service.name);

		// Find dependencies
		const serviceList =
			service.environment === "dev" ? allServices.dev : allServices.prod;
		const serviceInfo = serviceList.find((s) => s.name === service.name);
		if (serviceInfo?.dependencies) {
			for (const dep of serviceInfo.dependencies) {
				allServicesWithDeps.add(dep);
			}
		}
	}

	// Convert back to AffectedService objects
	const result: AffectedService[] = [];
	for (const serviceName of allServicesWithDeps) {
		// Find in dev services
		const devService = allServices.dev.find((s) => s.name === serviceName);
		if (devService) {
			result.push({
				name: devService.name,
				environment: "dev",
				port: devService.port,
			});
		}

		// Find in prod services
		const prodService = allServices.prod.find((s) => s.name === serviceName);
		if (prodService) {
			result.push({
				name: prodService.name,
				environment: "prod",
				port: prodService.port,
			});
		}
	}

	return result;
}

if (import.meta.main) {
	const affectedServices = await getAffectedServicesWithDependencies("all");
	console.log(affectedServices);
}
