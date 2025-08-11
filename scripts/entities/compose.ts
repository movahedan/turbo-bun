/** biome-ignore-all lint/complexity/noUselessConstructor: it's a simple util class */
import { parse as pYaml } from "yaml";

export interface ServiceInfo {
	readonly name: string;
	port?: number;
	hostPort?: number;
	containerPort?: number;
	readonly environment?: Record<string, string>;
	readonly dependencies?: string[];
	readonly healthcheck?: {
		readonly test: string[];
		readonly interval?: string;
		readonly timeout?: string;
		readonly retries?: number;
		readonly start_period?: string;
	};
}

export interface ServiceHealth {
	readonly name: string;
	readonly status: "healthy" | "unhealthy" | "starting" | "none";
	readonly port?: string;
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

export class EntityCompose {
	constructor() {}

	private static readonly composePaths = {
		dev: ".devcontainer/docker-compose.dev.yml",
		prod: "docker-compose.yml",
	} as const;

	static async parse(mode: "dev" | "prod") {
		const services = await EntityCompose.parseServices(EntityCompose.composePaths[mode]);

		return {
			exposedServices: () => services.filter((s) => s.port !== undefined),
			serviceHealth: async () => {
				const { $ } = await import("bun");
				return $`docker compose -f ${EntityCompose.composePaths[mode]} --profile all ps`.then(
					({ stdout }) => EntityCompose.parseDockerPsOutput(stdout.toString()),
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

	private static async parseServices(composePath: string): Promise<ServiceInfo[]> {
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

	private static parseDockerPsOutput(output: string): ServiceHealth[] {
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
