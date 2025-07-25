#!/usr/bin/env bun
import { $ } from "bun";
import { validators } from "./utils/arg-parser";
import { findCommand } from "./utils/command-finder";
import { createScript } from "./utils/create-scripts";

export const checkPipelines = createScript(
	{
		name: "GitHub Actions Local Testing",
		description:
			"Uses catthehacker/ubuntu:act-latest image which has unzip available for Bun setup",
		usage: "bun run check:pipelines -e <event> -w <workflow> [-v | --verbose]",
		examples: [
			"bun run check:pipelines -v --verbose -e pull_request -w .github/workflows/Check.yml",
			"bun run check:pipelines --event push --workflow .github/workflows/Build.yml",
			"bun run check:pipelines --event release --workflow .github/workflows/Deploy.yml",
			"bun run check:pipelines --event workflow_run --workflow .github/workflows/Check.yml",
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
					"workflow_run",
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
			{
				short: "-v",
				long: "--verbose",
				description: "Verbose output",
				required: false,
				validator: validators.boolean,
			},
		],
	} as const,
	async (args) => {
		console.log(`📋 on: ${args.event} at: ${args.workflow} \n`);

		const actCmd = await findCommand("act", undefined, undefined, args.verbose);
		await findCommand("docker", undefined, undefined, args.verbose);

		try {
			await $`${actCmd} ${args.event} -W ${args.workflow} -P ubuntu-latest=catthehacker/ubuntu:act-latest --quiet`;
			if (args.verbose) {
				console.log("✅ Success with catthehacker/ubuntu:act-latest image!");
			}
		} catch (error) {
			console.error("❌ Act test failed:", error);
			throw error;
		} finally {
			await cleanupActContainers();
		}

		console.log("✅ GitHub Actions test completed!");
	},
);

if (import.meta.main) {
	await checkPipelines();
}

// Cleanup function to stop and remove act containers
async function cleanupActContainers() {
	try {
		console.log("\n🧹 Cleaning up act containers...");

		try {
			// Check if any act containers exist before trying to stop them
			const runningContainers =
				await $`docker ps -q --filter "label=com.act.container"`.text();
			if (runningContainers.trim()) {
				await $`docker ps -q --filter "label=com.act.container" | xargs -r docker stop`;
				console.log("✅ Stopped running act containers");
			}
		} catch (error) {
			console.warn("⚠️  Warning: act containers do not exist:", error);
		}

		try {
			// Remove all act containers (including stopped ones)
			const allContainers =
				await $`docker ps -aq --filter "label=com.act.container"`.text();
			if (allContainers.trim()) {
				await $`docker ps -aq --filter "label=com.act.container" | xargs -r docker rm`;
				console.log("✅ Removed act containers");
			}
		} catch (error) {
			console.warn(
				"⚠️  Warning: act containers may not have been cleaned up:",
				error,
			);
		}

		try {
			// Remove act networks
			const networks =
				await $`docker network ls -q --filter "label=com.act.network"`.text();
			if (networks.trim()) {
				await $`docker network ls -q --filter "label=com.act.network" | xargs -r docker network rm`;
				console.log("✅ Removed act networks");
			}
		} catch (error) {
			console.warn("⚠️  Warning: act networks do not exist:", error);
		}

		console.log("✅ Act containers cleaned up successfully!");
	} catch (error) {
		console.warn(
			"⚠️  Warning: Some containers may not have been cleaned up:",
			error,
		);
	}
}
