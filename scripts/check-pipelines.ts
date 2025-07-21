#!/usr/bin/env bun

/**
 * GitHub Actions local testing - optimized for speed
 * Uses catthehacker/ubuntu:act-latest image which has unzip available for Bun setup
 *
 * Usage:
 *   bun run test:actions -e pull_request -w .github/workflows/Check.yml
 *   bun run test:actions --event push --workflow .github/workflows/Build.yml
 *   bun run test:actions:fast
 */

import { $ } from "bun";
import { validators } from "./utils/arg-parser";
import { findCommand } from "./utils/command-finder";
import { createScript } from "./utils/create-scripts";

// Cleanup function to stop and remove act containers
async function cleanupActContainers() {
	try {
		console.log("🧹 Cleaning up act containers...");

		// Check if any act containers exist before trying to stop them
		const runningContainers =
			await $`docker ps -q --filter "label=com.act.container"`.text();
		if (runningContainers.trim()) {
			await $`docker ps -q --filter "label=com.act.container" | xargs -r docker stop`;
			console.log("✅ Stopped running act containers");
		}

		// Remove all act containers (including stopped ones)
		const allContainers =
			await $`docker ps -aq --filter "label=com.act.container"`.text();
		if (allContainers.trim()) {
			await $`docker ps -aq --filter "label=com.act.container" | xargs -r docker rm`;
			console.log("✅ Removed act containers");
		}

		// Remove act networks
		const networks =
			await $`docker network ls -q --filter "label=com.act.network"`.text();
		if (networks.trim()) {
			await $`docker network ls -q --filter "label=com.act.network" | xargs -r docker network rm`;
			console.log("✅ Removed act networks");
		}

		// Remove buildx builder containers (created by Docker Buildx action)
		const buildxContainers =
			await $`docker ps -aq --filter "name=buildx_buildkit_builder"`.text();
		if (buildxContainers.trim()) {
			await $`docker ps -aq --filter "name=buildx_buildkit_builder" | xargs -r docker rm -f`;
			console.log("✅ Removed buildx builder containers");
		}

		// Remove buildx builder instances
		const builders =
			await $`docker buildx ls --format "{{.Name}}" | grep "builder-"`.text();
		if (builders.trim()) {
			const builderNames = builders.trim().split("\n");
			for (const builder of builderNames) {
				if (builder.trim()) {
					await $`docker buildx rm -f ${builder.trim()}`;
				}
			}
			console.log("✅ Removed buildx builder instances");
		}

		console.log("✅ Act containers cleaned up successfully!");
	} catch (error) {
		console.warn(
			"⚠️  Warning: Some containers may not have been cleaned up:",
			error,
		);
	}
}

const script = createScript(
	{
		name: "GitHub Actions Local Testing",
		description: "Test GitHub Actions workflows locally using act",
		usage: "bun run check:pipelines -e <event> -w <workflow>",
		examples: [
			"bun run check:pipelines -e pull_request -w .github/workflows/Check.yml",
			"bun run check:pipelines --event push --workflow .github/workflows/Build.yml",
			"bun run check:pipelines --event release --workflow .github/workflows/Deploy.yml",
		],
		options: [
			{
				short: "-e",
				long: "--event",
				description: "GitHub event to simulate (e.g., pull_request, push)",
				required: true,
				validator: validators.enum([
					"pull_request",
					"push",
					"release",
					"workflow_dispatch",
				]),
			},
			{
				short: "-w",
				long: "--workflow",
				description:
					"Workflow file to test (e.g., .github/workflows/Check.yml)",
				required: true,
				validator: validators.fileExists,
			},
		],
	} as const,
	async (args) => {
		console.log(`⚡ Testing GitHub Actions workflow: ${args.workflow}`);
		console.log(`📋 Event: ${args.event}`);

		const actCmd = await findCommand("act");
		await findCommand("docker");

		console.log(
			"🚀 Using catthehacker/ubuntu:act-latest image (has unzip for Bun setup)...",
		);

		try {
			// Run act without --reuse to ensure containers are cleaned up
			await $`${actCmd} ${args.event} -W ${args.workflow} -P ubuntu-latest=catthehacker/ubuntu:act-latest --quiet`;
			console.log("✅ Success with catthehacker/ubuntu:act-latest image!");
		} catch (error) {
			console.error("❌ Act test failed:", error);
			throw error;
		} finally {
			await cleanupActContainers();
		}

		console.log("✅ GitHub Actions test completed!");
	},
);

script();
