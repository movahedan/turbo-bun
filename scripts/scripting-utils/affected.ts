import { $ } from "bun";
import { parseCompose } from "./docker-compose-parser";
import { getAllDirectories } from "./get-all-directories";

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

/**
 * Get the last valid SHA for affected package detection
 * - For merge commits: use the first parent (previous main head)
 * - For regular commits: use origin/main
 * - If current branch is not main: use latest main
 */
export async function getBaseSha(): Promise<string> {
	// Get the current branch
	const currentBranch = await $`git branch --show-current`.text();
	const isOnMain = currentBranch.trim() === "main";

	// If not on main, use latest main
	if (!isOnMain) {
		console.log("📋 Not on main branch, using latest main as base");
		return "origin/main";
	}

	// Get the current commit SHA
	const currentSha = await $`git rev-parse HEAD`.text();
	console.log(`- Current SHA: ${currentSha.trim()}`);

	// Check if this is a merge commit (has 2 parents)
	// Check if we can access both parents (indicating a merge commit)
	let isMergeCommit = false;
	try {
		const parent1 = await $`git rev-parse ${currentSha.trim()}^1`.text();
		const parent2 = await $`git rev-parse ${currentSha.trim()}^2`.text();
		isMergeCommit = Boolean(parent1.trim() && parent2.trim());
	} catch {
		// If we can't access the second parent, it's not a merge commit
		isMergeCommit = false;
	}

	let baseSha: string;
	if (isMergeCommit) {
		console.log("🔍 Previous commit is a merge commit, finding base SHA...");

		// For merge commits, we want the previous head of main before the merge
		// This is the first parent of the merge commit
		const firstParent = await $`git rev-parse ${currentSha.trim()}^1`.text();
		console.log(`First parent (base): ${firstParent.trim()}`);

		baseSha = firstParent.trim();
	} else {
		console.log("📋 Previous commit is a regular commit, using it as base SHA.");
		// For regular commits, use the previous commit as base
		const previousCommit = await $`git rev-parse ${currentSha.trim()}^1`.text();
		baseSha = previousCommit.trim();
	}

	console.log(`- Base SHA: ${baseSha}`);
	return baseSha;
}

export async function getAffectedPackages(baseSha?: string): Promise<string[]> {
	// If no baseSha provided, determine it automatically
	const effectiveBaseSha = baseSha || (await getBaseSha());

	const affectedPackages =
		await $`bunx turbo run build --filter="...[${effectiveBaseSha}]" --dry-run=json`.quiet().json();

	// Remove root package
	return affectedPackages.packages.slice(1);
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
	const allDirectories = await getAllDirectories(process.cwd());

	const affectedServices: AffectedService[] = [];

	// Check dev services
	if (mode === "dev" || mode === "all") {
		for (const service of devServices.exposedServices()) {
			const isPackage = allDirectories.find(
				(d) => d.path.includes("packages") && d.path.includes(service.name),
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

	// Check prod services
	if (mode === "prod" || mode === "all") {
		for (const service of prodServices.exposedServices()) {
			const isPackage = allDirectories.find(
				(d) => d.path.includes("packages") && d.path.includes(service.name.replace(/^prod-/, "")),
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

if (import.meta.main) {
	// When run directly, get affected packages from last valid SHA
	const affectedPackages = await getAffectedPackages();
	console.log(JSON.stringify(affectedPackages));
}
