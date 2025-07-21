#!/usr/bin/env bun
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { type ExportCondition, prebuild } from "./prebuild-utils";

prebuild((srcDir: string, directories: string[]) => {
	const componentDirs = directories
		.filter((item) => {
			const itemPath = join(srcDir, item);
			return statSync(itemPath).isDirectory();
		})
		.filter((dir) => {
			// Check if directory has an index file
			const indexFiles = ["index.ts", "index.tsx", "index.js", "index.jsx"];
			return indexFiles.some((file) => existsSync(join(srcDir, dir, file)));
		})
		.map((dir) => dir.replace(".ts", ""));

	// Generate exports for each component
	const newExports: Record<string, ExportCondition> = {};

	for (const componentName of componentDirs) {
		newExports[`./${componentName}`] = {
			import: {
				types: `./dist/${componentName}/${componentName}.d.mts`,
				default: `./dist/${componentName}/${componentName}.mjs`,
			},
			require: {
				types: `./dist/${componentName}/${componentName}.d.ts`,
				default: `./dist/${componentName}/${componentName}.js`,
			},
		};
	}

	return newExports;
});
