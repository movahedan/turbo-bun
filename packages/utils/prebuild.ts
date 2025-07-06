#!/usr/bin/env bun
import { statSync } from "node:fs";
import { join } from "node:path";
import { type ExportCondition, prebuild } from "../../scripts/prebuild";

prebuild((srcDir: string, directories: string[]) => {
	const componentFiles = directories
		.filter((item) => {
			const itemPath = join(srcDir, item);
			return statSync(itemPath).isFile();
		})
		.filter((file) => {
			const isTestFile =
				file.endsWith(".test.ts") || file.endsWith(".test.tsx");
			const isTsFile = file.endsWith(".ts") || file.endsWith(".tsx");

			return !isTestFile && isTsFile;
		})
		.map((file) => file.replace(".ts", ""));

	// Generate exports for each component
	const newExports: Record<string, ExportCondition> = {};

	for (const componentName of componentFiles) {
		newExports[`./${componentName}`] = {
			import: {
				types: `./dist/${componentName}.d.mts`,
				default: `./dist/${componentName}.mjs`,
			},
			require: {
				types: `./dist/${componentName}.d.ts`,
				default: `./dist/${componentName}.js`,
			},
		};
	}

	return newExports;
});
