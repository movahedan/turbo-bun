import { $ } from "bun";
import { parseCompose } from "./docker-compose-parser";
import { getAllDirectories } from "./get-all-directories";

export async function getBaseSha(): Promise<string> {
	const currentBranch = await $`git branch --show-current`.text();
	const isOnMain = currentBranch.trim() === "main";

	if (!isOnMain) {
		console.log("📋 Not on main branch, using latest main as base");
		return "origin/main";
	}

	const currentSha = await $`git rev-parse HEAD`.text();
	return await $`git rev-parse ${currentSha.trim()}^1`.text();
}

export async function getAffectedPackages(baseSha?: string): Promise<string[]> {
	const effectiveBaseSha = baseSha || (await getBaseSha());

	const affectedPackages =
		await $`bunx turbo run build --filter="...[${effectiveBaseSha}]" --dry-run=json`.quiet().json();

	// Remove root package
	return affectedPackages.packages.slice(1);
}

if (import.meta.main) {
	const affectedPackages = await getAffectedPackages();
	console.log(JSON.stringify(affectedPackages));
}

type ServiceMode = "dev" | "prod" | "all";

export interface AffectedService {
	name: string;
	environment: ServiceMode;
	port?: number;
}

async function getAffectedServices(mode: ServiceMode): Promise<AffectedService[]> {
	const keys = await getAffectedPackages();
	const devServices = await parseCompose("dev");
	const prodServices = await parseCompose("prod");
	const allDirectories = await getAllDirectories();

	const affectedServices: AffectedService[] = [];

	if (mode === "dev" || mode === "all") {
		for (const service of devServices.exposedServices()) {
			const isPackage = allDirectories.find(
				(d) => d.includes("packages") && d.includes(service.name),
			);

			const serviceKey = isPackage ? `@repo/${service.name}` : service.name;
			if (keys.some((k: string) => k === serviceKey)) {
				affectedServices.push({
					name: service.name,
					environment: "dev",
					port: service.port,
				});
			}
		}
	}

	if (mode === "prod" || mode === "all") {
		for (const service of prodServices.exposedServices()) {
			const isPackage = allDirectories.find(
				(d) => d.includes("packages") && d.includes(service.name.replace(/^prod-/, "")),
			);

			const serviceKey = isPackage ? `@repo/${service.name.replace(/^prod-/, "")}` : service.name;
			if (keys.some((k: string) => k === serviceKey.replace(/^prod-/, ""))) {
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
	try {
		const affectedServices = await getAffectedServices(mode);
		const devServices = await parseCompose("dev");
		const prodServices = await parseCompose("prod");

		const allServicesWithDeps = new Set<string>();

		// Add affected services and their dependencies
		for (const service of affectedServices) {
			allServicesWithDeps.add(service.name);

			// Find dependencies
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

		// Convert back to AffectedService objects
		const result: AffectedService[] = [];
		for (const serviceName of allServicesWithDeps) {
			// Find in dev services
			const devService = devServices.exposedServices().find((s) => s.name === serviceName);
			if (devService) {
				result.push({
					name: devService.name,
					environment: "dev",
					port: devService.port,
				});
			}

			// Find in prod services
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
