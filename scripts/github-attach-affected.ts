#!/usr/bin/env bun
import {
	getAffectedServices,
	getAffectedServicesWithDependencies,
} from "./get-affected-services";

async function githubAttachAffected() {
	try {
		const affectedServices = await getAffectedServices();
		const affectedServicesAll = await getAffectedServicesWithDependencies();

		// Output in GitHub Actions format
		if (process.env.GITHUB_OUTPUT) {
			const output = `packages<<EOF\n${affectedServicesAll.join(" ")}\nEOF\n`;
			await Bun.write(process.env.GITHUB_OUTPUT, output);
		}

		if (affectedServices.length === 0) {
			console.log("No affected packages found");
		} else {
			// Output clean list for bash capture
			console.log(
				"Affected packages:",
				affectedServices.map((s) => JSON.stringify(s)).join("\n"),
			);
			console.log(
				"Required services (including dependencies):",
				affectedServicesAll.map((s) => JSON.stringify(s)).join("\n"),
			);
		}

		process.exit(0);
	} catch (error) {
		console.error("Error getting affected packages:", error);
		process.exit(1);
	}
}

if (import.meta.main) {
	await githubAttachAffected();
}
