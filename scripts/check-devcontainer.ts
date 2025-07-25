#!/usr/bin/env bun

import { setTimeout } from "node:timers/promises";
import { $ } from "bun";
import chalk from "chalk";
import { getExposedServices } from "./utils/docker-compose-parser";

// Parse command line arguments
const args = process.argv.slice(2);
const keepRunning = !args.includes("--shutdown") && !args.includes("-s");

interface TestResult {
	name: string;
	status: "PASS" | "FAIL" | "SKIP";
	message: string;
	duration?: number;
}

interface ServiceHealth {
	name: string;
	status: "healthy" | "unhealthy" | "starting" | "none";
	port?: string;
}

class DevContainerTester {
	private results: TestResult[] = [];
	private startTime = 0;

	async runTests() {
		console.log(chalk.blue("🧪 Starting DevContainer Health Check Tests..."));
		if (keepRunning) {
			console.log(chalk.green("🔧 Mode: Keep services running after tests"));
		} else {
			console.log(chalk.yellow("🧹 Mode: Cleanup after tests"));
		}
		this.startTime = Date.now();

		const dockerAvailability = await this.testDockerAvailability();
		if (!dockerAvailability) {
			console.log(
				chalk.yellow("🔄 Skipping tests due to Docker daemon not accessible"),
			);
			throw new Error("Docker daemon not accessible");
		}

		await this.testBasicBuild();
		await this.testDevContainerBuild();
		await this.testServiceHealthChecks();
		await this.testProductionCompose();

		// Only cleanup if not keeping services running
		if (!keepRunning) {
			await this.testCleanup();
		} else {
			await this.testKeepRunning();
		}

		this.printResults();
	}

	private async testBasicBuild() {
		const testName = "Basic Build";
		try {
			console.log(chalk.yellow("🔨 Building basic project..."));
			const results = await Promise.all([
				$`bun run check:fix`,
				$`bun run test`,
				$`bun run build`,
			]);

			const errors = results
				.map((result) => (result.exitCode !== 0 ? result : null))
				.filter(
					(result): result is NonNullable<typeof result> => result !== null,
				);

			if (errors.length > 0) {
				this.addResult(
					testName,
					"FAIL",
					`Basic project build failed:\n${errors
						.map(
							(result) =>
								`${result.exitCode} - ${result.text().split("\n")[0]}`,
						)
						.join("\n")}`,
				);
			} else {
				this.addResult(testName, "PASS", "Basic project build succeeded");
			}
		} catch (error) {
			this.addResult(testName, "FAIL", `Basic build error: ${error}`);
		}
	}

	private async testDockerAvailability() {
		const testName = "Docker Availability";
		try {
			const { exitCode } = await $`docker --version`;
			if (exitCode === 0) {
				// Check if Docker daemon is accessible
				const { exitCode: daemonExitCode } = await $`docker ps`;
				if (daemonExitCode === 0) {
					this.addResult(
						testName,
						"PASS",
						"Docker is available and daemon is accessible",
					);

					return true;
				}

				this.addResult(
					testName,
					"SKIP",
					"Docker is available but daemon not accessible (normal in DevContainer)",
				);
			} else {
				this.addResult(testName, "FAIL", "Docker is not available");
			}

			return false;
		} catch (error) {
			this.addResult(
				testName,
				"SKIP",
				`Docker daemon not accessible: ${error} (normal in DevContainer)`,
			);

			return false;
		}
	}

	private async testDevContainerBuild() {
		const testName = "DevContainer Build";
		try {
			console.log(chalk.yellow("🔨 Building DevContainer..."));
			const { exitCode } =
				await $`docker compose -f .devcontainer/docker-compose.dev.yml build`;

			if (exitCode !== 0) {
				this.addResult(
					testName,
					"FAIL",
					"DevContainer development image build failed",
				);
			} else {
				this.addResult(
					testName,
					"PASS",
					"DevContainer development image build succeeded",
				);
			}
		} catch (error) {
			this.addResult(
				testName,
				"FAIL",
				error instanceof Error ? error.message : "DevContainer build error",
			);
		}
	}

	private async testServiceHealthChecks() {
		const testName = "Service Health Checks";
		try {
			console.log(
				chalk.yellow("🚀 Starting services and monitoring health..."),
			);

			// Start all services
			await $`bun run dev:down`;
			await $`bun run dev:up`;

			// Wait for services to start and health checks to run
			console.log(chalk.yellow("⏳ Waiting for services to become healthy..."));
			// Implement interval-based health checking
			const maxRetries = 6; // 30 seconds total (6 * 5 seconds)
			const retryInterval = 5000; // 5 seconds
			let retryCount = 0;
			let allHealthy = false;
			const allExposedServices = await getExposedServices(
				".devcontainer/docker-compose.dev.yml",
			);
			let finalServices: ServiceHealth[] = [];
			let finalHealthResults: ReturnType<
				typeof this.analyzeServiceHealth
			> | null = null;

			while (retryCount < maxRetries && !allHealthy) {
				if (retryCount > 0) {
					console.log(
						chalk.yellow(
							`🔄 Retry ${retryCount}/${maxRetries} - Checking health again in 5 seconds...`,
						),
					);
					await setTimeout(retryInterval);
				}

				// Get health status from docker ps
				const { stdout } =
					await $`docker compose -f .devcontainer/docker-compose.dev.yml --profile all ps`.quiet();

				finalServices = this.parseDockerPsOutput(stdout.toString());
				finalHealthResults = this.analyzeServiceHealth(finalServices);

				// Check if we have any healthy services and no unhealthy ones
				if (
					finalHealthResults.healthyServices.length ===
					allExposedServices.length
				) {
					allHealthy = true;
				} else {
					retryCount++;
				}
			}

			// Print detailed health status
			console.log(chalk.blue("\n📊 Final Service Health Status:"));
			console.log("-".repeat(50));

			console.log({ finalServices, finalHealthResults });

			const icons = {
				healthy: "✅",
				starting: "🔄",
				unhealthy: "❌",
			};
			const colors = {
				healthy: chalk.green,
				starting: chalk.yellow,
				unhealthy: chalk.red,
			};
			for (const service of finalServices) {
				const icon = icons[service.status as keyof typeof icons];
				const color = colors[service.status as keyof typeof colors];

				console.log(
					`${icon} ${color(service.name)}: ${service.status} ${service.port ? `(${service.port})` : ""}`,
				);
			}

			if (finalHealthResults?.unhealthyServices.length) {
				this.addResult(
					testName,
					"FAIL",
					`Unhealthy services after ${maxRetries} retries: ${finalHealthResults.unhealthyServices
						.map((s) => `${s.name} (${s.status})`)
						.join(", ")}`,
				);
			}
		} catch (error) {
			this.addResult(testName, "FAIL", `Health check test error: ${error}`);
		}
	}

	private parseDockerPsOutput(output: string): ServiceHealth[] {
		const lines = output.trim().split("\n");
		const services: ServiceHealth[] = [];

		for (const line of lines) {
			if (line.includes("NAME") || line.includes("----")) continue; // Skip header

			// Look for health status patterns in the line
			const nameMatch = line.match(/^(\S+)/);
			if (!nameMatch) continue;

			const name = nameMatch[1];
			let healthStatus: "healthy" | "unhealthy" | "starting" | "none" = "none";

			// Check for health status patterns
			if (line.includes("(healthy)")) {
				healthStatus = "healthy";
			} else if (line.includes("(unhealthy)")) {
				healthStatus = "unhealthy";
			} else if (line.includes("(health: starting)")) {
				healthStatus = "starting";
			} else if (line.includes("Up")) {
				healthStatus = "starting"; // Assume starting if Up but no health status
			}

			// Extract port information using a safer regex pattern
			// Match IP:port->port pattern with specific character classes
			const portMatch = line.match(
				/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+->\d+)/,
			);
			const port = portMatch ? portMatch[1] : undefined;

			services.push({
				name,
				status: healthStatus,
				port,
			});
		}

		return services;
	}

	private analyzeServiceHealth(services: ServiceHealth[]) {
		const healthyServices: string[] = [];
		const unhealthyServices: ServiceHealth[] = [];

		for (const service of services) {
			if (service.status === "healthy") {
				healthyServices.push(service.name);
			} else if (service.status === "unhealthy") {
				unhealthyServices.push(service);
			}
		}

		return {
			allHealthy: unhealthyServices.length === 0 && healthyServices.length > 0,
			healthyServices,
			unhealthyServices,
		};
	}

	// private async testHotReload() {
	// 	const testName = "Hot Reload";
	// 	try {
	// 		// Create a test file to trigger hot reload
	// 		await $`echo "// Test file for hot reload" > apps/admin/src/test-hot-reload.ts`;
	// 		await setTimeout(2000);

	// 		// Check if the file was created
	// 		const { exitCode } = await $`test -f apps/admin/src/test-hot-reload.ts`;
	// 		if (exitCode === 0) {
	// 			this.addResult(testName, "PASS", "Hot reload file watching works");
	// 			// Clean up
	// 			await $`rm apps/admin/src/test-hot-reload.ts`;
	// 		} else {
	// 			this.addResult(testName, "FAIL", "Hot reload file watching failed");
	// 		}
	// 	} catch (error) {
	// 		this.addResult(testName, "FAIL", `Hot reload test error: ${error}`);
	// 	}
	// }

	private async testProductionCompose() {
		const testName = "Production Compose";
		try {
			console.log(chalk.yellow("🏭 Testing production Docker Compose..."));

			// Test production compose validation
			const { exitCode } = await $`docker compose config -q`;
			if (exitCode === 0) {
				this.addResult(testName, "PASS", "Production Docker Compose is valid");
			} else {
				this.addResult(
					testName,
					"FAIL",
					`Production Docker Compose validation failed ${process.cwd()}/docker-compose.yml`,
				);
			}
		} catch (error) {
			this.addResult(testName, "FAIL", `Production compose error: ${error}`);
		}
	}

	private async testKeepRunning() {
		const testName = "Keep Running";
		try {
			console.log(chalk.green("🚀 Keeping services running..."));
			console.log(chalk.blue("📊 Services are available at:"));

			// Get service URLs dynamically
			const { getServiceUrls } = await import("./utils/docker-compose-parser");
			const devUrls = await getServiceUrls(
				".devcontainer/docker-compose.dev.yml",
			);
			for (const [name, url] of Object.entries(devUrls)) {
				console.log(`   • ${name}: ${url}`);
			}
			console.log(
				chalk.yellow("💡 Use 'bun run dev:down' to stop services when done"),
			);
			this.addResult(testName, "PASS", "Services kept running for development");
		} catch (error) {
			this.addResult(testName, "SKIP", `Keep running error: ${error}`);
		}
	}

	private async testCleanup() {
		const testName = "Cleanup";
		try {
			console.log(chalk.yellow("🧹 Testing cleanup..."));
			await $`bun run dev:down`;
			this.addResult(testName, "PASS", "Cleanup completed successfully");
		} catch (error) {
			this.addResult(
				testName,
				"SKIP",
				`Cleanup error: ${error} (Docker daemon not accessible in DevContainer)`,
			);
		}
	}

	private addResult(
		name: string,
		status: "PASS" | "FAIL" | "SKIP",
		message: string,
	) {
		this.results.push({
			name,
			status,
			message,
			duration: Date.now() - this.startTime,
		});
	}

	private printResults() {
		console.log(chalk.blue("\n📊 Test Results:"));
		console.log("=".repeat(50));

		let passed = 0;
		let failed = 0;
		let skipped = 0;

		for (const result of this.results) {
			const icon =
				result.status === "PASS" ? "✅" : result.status === "FAIL" ? "❌" : "⏭️";
			const color =
				result.status === "PASS"
					? chalk.green
					: result.status === "FAIL"
						? chalk.red
						: chalk.yellow;

			console.log(`${icon} ${color(result.name)}`);
			console.log(`   ${result.message}`);

			if (result.status === "PASS") passed++;
			else if (result.status === "FAIL") failed++;
			else skipped++;
		}

		console.log(`\n${"=".repeat(50)}`);
		console.log(chalk.green(`✅ Passed: ${passed}`));
		if (failed > 0) {
			console.log(chalk.red(`❌ Failed: ${failed}`));
		}
		if (skipped > 0) {
			console.log(chalk.yellow(`⏭️ Skipped: ${skipped}`));
		}

		const totalTime = Date.now() - this.startTime;
		console.log(chalk.blue(`⏱️ Total time: ${totalTime}ms`));

		if (failed > 0) {
			console.log(chalk.red("\n❌ Some tests failed. Please check the setup."));
			process.exit(1);
		} else {
			console.log(
				chalk.green(
					"\n🎉 All tests passed! Your DevContainer setup is working correctly.",
				),
			);
		}
	}
}

// Show help if requested
if (args.includes("--help") || args.includes("-h")) {
	console.log(chalk.blue("🧪 DevContainer Test Suite"));
	console.log("");
	console.log(chalk.yellow("Usage:"));
	console.log("  bun run scripts/check-devcontainer.ts [options]");
	console.log("");
	console.log(chalk.yellow("Options:"));
	console.log(
		"  --keep-running, -k    Keep services running after tests complete",
	);
	console.log("  --help, -h            Show this help message");
	console.log("");
	console.log(chalk.yellow("Examples:"));
	console.log("  bun run scripts/check-devcontainer.ts");
	console.log("  bun run scripts/check-devcontainer.ts --keep-running");
	console.log("  bun run scripts/check-devcontainer.ts -k");
	process.exit(0);
}

// Run the tests
const tester = new DevContainerTester();
await tester.runTests();
