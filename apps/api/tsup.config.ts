import { type Options, defineConfig } from "tsup";

export default defineConfig((options: Options) => ({
	entryPoints: ["src/index.ts"],
	clean: true,
	format: ["cjs"],
	...options,
}));
