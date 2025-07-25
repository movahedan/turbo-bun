import { $ } from "bun";
import { findCommand } from "./utils/command-finder";
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
	const turboPath = await findCommand("turbo");

	const affectedPackages =
		await $`${turboPath} run build --filter="...[origin/main]" --dry-run=json`
			.quiet()
			.json();

	// Remove root package
	return affectedPackages.packages.slice(1);
}

export interface AffectedService {
	name: string;
	environment: "dev" | "prod";
	port?: number;
}

export async function getAffectedServices(): Promise<AffectedService[]> {
	const keys = await getAffectedPackages();
	const allServices = await getAllServices();

	const affectedServices: AffectedService[] = [];

	// Check dev services
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

	// Check prod services
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

	return affectedServices;
}

/**
 * Get affected services with their dependencies
 */
export async function getAffectedServicesWithDependencies(): Promise<
	AffectedService[]
> {
	const affectedServices = await getAffectedServices();
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
