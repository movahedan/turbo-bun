#!/usr/bin/env bun

import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

// Get platform information
const platform = os.platform();
const arch = os.arch();

// Map platform and architecture to the correct SWC binary
const swcBinaryMap: Record<string, Record<string, string>> = {
	linux: {
		x64: "@next/swc-linux-x64-gnu",
		arm64: "@next/swc-linux-arm64-gnu",
	},
	darwin: {
		x64: "@next/swc-darwin-x64",
		arm64: "@next/swc-darwin-arm64",
	},
	win32: {
		x64: "@next/swc-win32-x64-msvc",
		arm64: "@next/swc-win32-arm64-msvc",
	},
};

// Get the appropriate binary for the current platform
const getSwcBinary = (): string | null => {
	const platformBinaries = swcBinaryMap[platform];
	if (!platformBinaries) {
		console.log(
			`Platform ${platform} is not supported, skipping SWC binary installation`,
		);
		return null;
	}

	const binary = platformBinaries[arch];
	if (!binary) {
		console.log(
			`Architecture ${arch} on platform ${platform} is not supported, skipping SWC binary installation`,
		);
		return null;
	}

	return binary;
};

// Check if we're in a development environment
const isDev =
	process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

// Only install in production or when explicitly requested
if (isDev && !process.env.FORCE_SWC_INSTALL) {
	console.log(
		"Development environment detected, skipping SWC binary installation",
	);
	console.log("Next.js will auto-install SWC binaries as needed");
	process.exit(0);
}

const swcBinary = getSwcBinary();

if (swcBinary) {
	try {
		console.log(`Installing SWC binary for ${platform}-${arch}: ${swcBinary}`);

		// Use spawnSync with argument array to prevent command injection
		const result = spawnSync("bun", ["add", `${swcBinary}@15.4.2`], {
			stdio: "inherit",
			cwd: path.resolve(__dirname, ".."),
		});

		if (result.status !== 0) {
			throw new Error(`bun add failed with exit code ${result.status}`);
		}

		console.log("SWC binary installed successfully");
	} catch (error) {
		console.error(
			"Failed to install SWC binary:",
			error instanceof Error ? error.message : String(error),
		);
		console.log("Next.js will auto-install SWC binaries as needed");
	}
} else {
	console.log("No compatible SWC binary found for this platform");
	console.log("Next.js will auto-install SWC binaries as needed");
}
