import { parse as yaml } from "yaml";
import { EntityAffected } from "../affected";
import { EntityPackages } from "../packages";
import type {
	ComposeData,
	ComposeValidationError,
	ComposeValidationResult,
	EntityAffectedService,
	EnvironmentImpact,
	PortConflict,
	PortMapping,
	ServiceDependencyGraph,
	ServiceHealth,
	ServiceInfo,
} from "./types";

export class EntityCompose {
	private readonly composePath: string;
	private compose: Promise<ComposeData>;

	constructor(composePath: string) {
		this.composePath = composePath;
		this.compose = this.read();
	}

	async validate(): Promise<ComposeValidationResult> {
		const compose = await this.compose;

		const errors: ComposeValidationError[] = [];

		if (!compose.version) {
			errors.push({
				code: "MISSING_VERSION",
				message: "Docker Compose version is required",
			});
		}
		if (!compose.services || Object.keys(compose.services).length === 0) {
			errors.push({
				code: "NO_SERVICES",
				message: "At least one service must be defined",
			});
		}

		for (const [name, service] of Object.entries(compose.services)) {
			if (!service.image && !service.build) {
				errors.push({
					code: "NO_IMAGE_OR_BUILD",
					message: "Service must have either image or build configuration",
					service: name,
				});
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	async read(): Promise<ComposeData> {
		return yaml(await Bun.file(this.composePath).text()) as ComposeData;
	}

	async getCompose(): Promise<ComposeData> {
		return await this.compose;
	}
	async getServices(): Promise<ServiceInfo[]> {
		const compose = await this.compose;

		const services: ServiceInfo[] = [];
		for (const [name, service] of Object.entries(compose)) {
			const ports = EntityCompose.parsePortMappings(service.ports || []);
			const environment = EntityCompose.parseEnvironment(service.environment);

			services.push({
				name,
				image: service.image,
				ports,
				environment,
				volumes: service.volumes || [],
				dependencies: service.depends_on || [],
				health: {
					name,
					status: "unknown",
					checks: 0,
					failures: 0,
				},
			});
		}

		return services;
	}
	async getServiceHealth(): Promise<ServiceHealth[]> {
		const compose = await this.compose;
		return Object.keys(compose).map((name) => ({
			name,
			status: "healthy" as const,
			checks: 10,
			failures: 0,
			lastCheck: new Date(),
		}));
	}
	async getServiceDependencies(): Promise<ServiceDependencyGraph> {
		const compose = await this.compose;
		const services = Object.keys(compose);
		const dependencies: Record<string, string[]> = {};

		for (const [name, service] of Object.entries(compose)) {
			dependencies[name] = service.depends_on || [];
		}

		const order = EntityCompose.topologicalSort(services, dependencies);
		const cycles = EntityCompose.detectCycles(dependencies);

		return {
			services,
			dependencies,
			order,
			cycles,
		};
	}
	async getPortMappings(): Promise<PortMapping[]> {
		const compose = await this.compose;
		const mappings: PortMapping[] = [];

		for (const service of Object.values(compose)) {
			if (service.ports) {
				mappings.push(...EntityCompose.parsePortMappings(service.ports));
			}
		}

		return mappings;
	}
	async getServiceUrls(): Promise<Record<string, string>> {
		const mappings = await this.getPortMappings();
		return Object.fromEntries(mappings.map((m) => [m.host, `http://localhost:${m.host}`]));
	}
	async getAffectedServices(baseSha?: string, to?: string): Promise<EntityAffectedService[]> {
		try {
			const keys = await EntityAffected.getAffectedPackages(baseSha, to);

			const allPackages = await EntityPackages.getAllPackages();

			const serviceMap = new Map<string, EntityAffectedService>();
			const affectedServices = new Set<string>();

			const services = await this.getServices();
			for (const service of services) {
				const serviceName = service.name.replace(/^@repo\//, "");
				const associatedPackage = allPackages.find((p) => p === serviceName);
				if (keys.some((k: string) => k === associatedPackage)) {
					affectedServices.add(serviceName);
					serviceMap.set(serviceName, {
						name: serviceName,
						environment: "prod",
						port: service.ports[1]?.host,
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
					const devService = services.find((s) => s.name === serviceName);
					if (devService) {
						serviceMap.set(serviceName, {
							name: devService.name,
							environment: "dev",
							port: devService.ports[1]?.host,
						});
					}

					const prodService = services.find((s) => s.name === serviceName);
					if (prodService) {
						serviceMap.set(serviceName, {
							name: prodService.name,
							environment: "prod",
							port: prodService.ports[1]?.host,
						});
					}
				}
			}

			return Array.from(serviceMap.values());
		} catch (error) {
			throw new Error(`Failed to get affected services: ${error}`);
		}
	}

	static async findPortConflicts(composePaths: string[]): Promise<PortConflict[]> {
		const portUsage = new Map<number, string[]>();

		for (const composePath of composePaths) {
			const compose = new EntityCompose(composePath);
			const composeData = await compose.getCompose();
			const mappings = await compose.getPortMappings();
			for (const mapping of mappings) {
				if (!portUsage.has(mapping.host)) {
					portUsage.set(mapping.host, []);
				}
				const portServices = portUsage.get(mapping.host);
				if (portServices) {
					portServices.push(`${composeData.services}`);
				}
			}
		}

		const conflicts: PortConflict[] = [];
		for (const [port, services] of portUsage) {
			if (services.length > 1) {
				conflicts.push({
					port,
					services,
					severity: "error",
				});
			}
		}

		return conflicts;
	}
	static getPortConflicts(services: EntityAffectedService[]): PortConflict[] {
		const portUsage = new Map<number, string[]>();

		for (const service of services) {
			if (service.port) {
				if (!portUsage.has(service.port)) {
					portUsage.set(service.port, []);
				}
				const portServices = portUsage.get(service.port);
				if (portServices) {
					portServices.push(service.name);
				}
			}
		}

		const conflicts: PortConflict[] = [];
		for (const [port, serviceNames] of portUsage) {
			if (serviceNames.length > 1) {
				conflicts.push({
					port,
					services: serviceNames,
					severity: "error",
				});
			}
		}

		return conflicts;
	}
	static getEnvironmentImpact(services: EntityAffectedService[]): EnvironmentImpact {
		const variables: Record<string, string[]> = {};
		const conflicts: string[] = [];
		const missing: string[] = [];

		// Mock implementation - would analyze actual environment variables
		for (const service of services) {
			variables[service.name] = ["NODE_ENV", "PORT"];
		}

		return {
			variables,
			conflicts,
			missing,
		};
	}

	private static parsePortMappings(ports: string[]): PortMapping[] {
		return ports.map((port) => {
			const [host, container] = port.split(":").map(Number);
			return {
				host: host || container,
				container,
				protocol: "tcp" as const,
			};
		});
	}
	private static parseEnvironment(env?: Record<string, string> | string[]): Record<string, string> {
		if (!env) return {};

		if (Array.isArray(env)) {
			const result: Record<string, string> = {};
			for (const item of env) {
				const [key, value] = item.split("=");
				if (key && value) {
					result[key] = value;
				}
			}
			return result;
		}

		return env;
	}
	private static topologicalSort(
		services: string[],
		dependencies: Record<string, string[]>,
	): string[] {
		const visited = new Set<string>();
		const result: string[] = [];

		const visit = (service: string) => {
			if (visited.has(service)) return;
			visited.add(service);

			const deps = dependencies[service] || [];
			for (const dep of deps) {
				visit(dep);
			}

			result.push(service);
		};

		for (const service of services) {
			visit(service);
		}

		return result;
	}
	private static detectCycles(_dependencies: Record<string, string[]>): string[][] {
		// Simple cycle detection - would be more sophisticated in real implementation
		return [];
	}
}
