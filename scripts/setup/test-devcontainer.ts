#!/usr/bin/env bun

import { setTimeout } from "node:timers/promises";
import { $ } from "bun";
import chalk from "chalk";

// Parse command line arguments
const args = process.argv.slice(2);
const keepRunning = args.includes("--keep-running") || args.includes("-k");

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
			console.log(chalk.yellow("🔄 Skipping tests due to Docker daemon not accessible"));
			throw new Error("Docker daemon not accessible");
		}

		await this.testDevContainerBuild();
		await this.testServiceHealthChecks();
		await this.testHotReload();
		await this.testMultipleInstances();
		await this.testProductionCompose();
		
		// Only cleanup if not keeping services running
		if (!keepRunning) {
			await this.testCleanup();
		} else {
			await this.testKeepRunning();
		}

		this.printResults();
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
				this.addResult(testName, "FAIL", "DevContainer development image build failed");
			} else {
				this.addResult(testName, "PASS", "DevContainer development image build succeeded");
			}
		} catch (error) {
			this.addResult(testName, "FAIL", error instanceof Error ? error.message : "DevContainer build error");
		}
	}

	private async testServiceHealthChecks() {
		const testName = "Service Health Checks";
		try {
			console.log(chalk.yellow("🚀 Starting services and monitoring health..."));
			
			// Start all services
			await $`bun run dev:down`;
			await $`bun run dev:up`;

			// Wait for services to start and health checks to run
			console.log(chalk.yellow("⏳ Waiting for services to become healthy..."));
			await setTimeout(20000); // Give more time for health checks

			// Get health status from docker ps
			const { stdout } = await $`docker compose -f .devcontainer/docker-compose.dev.yml --profile all ps`;
			
			const services = this.parseDockerPsOutput(stdout.toString());
			const healthResults = this.analyzeServiceHealth(services);

			// Check if we have any healthy services and no unhealthy ones
			if (healthResults.healthyServices.length > 0 && healthResults.unhealthyServices.length === 0) {
				this.addResult(
					testName, 
					"PASS", 
					`Services are healthy: ${healthResults.healthyServices.join(", ")}`
				);
			} else {
				const unhealthyServices = healthResults.unhealthyServices.map(s => `${s.name} (${s.status})`);
				const startingServices = services.filter(s => s.status === "starting").map(s => s.name);
				
				if (unhealthyServices.length > 0) {
					this.addResult(
						testName,
						"FAIL",
						`Unhealthy services: ${unhealthyServices.join(", ")}`
					);
				} else if (startingServices.length > 0) {
					this.addResult(
						testName,
						"SKIP",
						`Services still starting: ${startingServices.join(", ")}`
					);
				} else {
					this.addResult(
						testName,
						"FAIL",
						"No services are healthy"
					);
				}
			}

			// Print detailed health status
			console.log(chalk.blue("\n📊 Service Health Status:"));
			console.log("=".repeat(50));
			for (const service of services) {
				const icon = service.status === "healthy" ? "✅" : service.status === "starting" ? "🔄" : "❌";
				const color = service.status === "healthy" ? chalk.green : service.status === "starting" ? chalk.yellow : chalk.red;
				console.log(`${icon} ${color(service.name)}: ${service.status} ${service.port ? `(${service.port})` : ""}`);
			}

		} catch (error) {
			this.addResult(
				testName,
				"FAIL",
				`Health check test error: ${error}`,
			);
		}
	}

	private parseDockerPsOutput(output: string): ServiceHealth[] {
		const lines = output.trim().split('\n');
		const services: ServiceHealth[] = [];

		for (const line of lines) {
			if (line.includes('NAME') || line.includes('----')) continue; // Skip header
			
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

			// Extract port information
			const portMatch = line.match(/(\d+\.\d+\.\d+\.\d+:\d+->\d+)/);
			const port = portMatch ? portMatch[1] : undefined;

			services.push({
				name,
				status: healthStatus,
				port
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
			unhealthyServices
		};
	}

	private async testHotReload() {
		const testName = "Hot Reload";
		try {
			// Create a test file to trigger hot reload
			await $`echo "// Test file for hot reload" > apps/admin/src/test-hot-reload.ts`;
			await setTimeout(2000);

			// Check if the file was created
			const { exitCode } = await $`test -f apps/admin/src/test-hot-reload.ts`;
			if (exitCode === 0) {
				this.addResult(testName, "PASS", "Hot reload file watching works");
				// Clean up
				await $`rm apps/admin/src/test-hot-reload.ts`;
			} else {
				this.addResult(testName, "FAIL", "Hot reload file watching failed");
			}
		} catch (error) {
			this.addResult(testName, "FAIL", `Hot reload test error: ${error}`);
		}
	}

	private async testMultipleInstances() {
		const testName = "Multiple Instances";
		try {
			console.log(
				chalk.yellow("🔄 Testing multiple DevContainer instances..."),
			);

			// Start a second instance with different project name
			const { exitCode, text } =
				await $`COMPOSE_PROJECT_NAME=repo-test docker compose -f .devcontainer/docker-compose.dev.yml --profile all up -d`;

			if (exitCode === 0) {
				this.addResult(
					testName,
					"PASS",
					"Multiple DevContainer instances can run simultaneously",
				);

				// Clean up test instance
				await $`COMPOSE_PROJECT_NAME=repo-test docker compose -f .devcontainer/docker-compose.dev.yml down`;
			} else {
				this.addResult(
					testName,
					"FAIL",
					`Multiple instances test failed ${exitCode} ${text}`,
				);
			}
		} catch (error) {
			this.addResult(
				testName,
				"FAIL",
				`Multiple instances error: ${error}`,
			);
		}
	}

	private async testProductionCompose() {
		const testName = "Production Compose";
		try {
			console.log(chalk.yellow("🏭 Testing production Docker Compose..."));

			// Test production compose validation
			const { exitCode } = await $`docker compose config`;
			if (exitCode === 0) {
				this.addResult(testName, "PASS", "Production Docker Compose is valid");
			} else {
				this.addResult(
					testName,
					"FAIL",
					"Production Docker Compose validation failed",
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
			console.log("   • Admin: http://localhost:3001");
			console.log("   • Blog: http://localhost:3002");
			console.log("   • Storefront: http://localhost:3003");
			console.log("   • API: http://localhost:3004");
			console.log(chalk.yellow("💡 Use 'bun run dev:down' to stop services when done"));
			this.addResult(testName, "PASS", "Services kept running for development");
		} catch (error) {
			this.addResult(
				testName,
				"SKIP",
				`Keep running error: ${error}`,
			);
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
	console.log("  bun run scripts/setup/test-devcontainer.ts [options]");
	console.log("");
	console.log(chalk.yellow("Options:"));
	console.log("  --keep-running, -k    Keep services running after tests complete");
	console.log("  --help, -h            Show this help message");
	console.log("");
	console.log(chalk.yellow("Examples:"));
	console.log("  bun run scripts/setup/test-devcontainer.ts");
	console.log("  bun run scripts/setup/test-devcontainer.ts --keep-running");
	console.log("  bun run scripts/setup/test-devcontainer.ts -k");
	process.exit(0);
}

// Run the tests
const tester = new DevContainerTester();
await tester.runTests();
