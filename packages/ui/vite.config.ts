import { join } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteEntries from "./vite-entries.generated.json";

export default defineConfig({
	plugins: [
		react(),
		{
			name: "preserve-use-client",
			transform(code, id) {
				if (id.endsWith(".tsx") || id.endsWith(".ts")) {
					// Preserve "use client" directive in the output
					if (code.includes('"use client"')) {
						return {
							code: `"use client";\n${code.replace('"use client";', "")}`,
							map: null,
						};
					}
				}
			},
		},
	],
	build: {
		lib: {
			entry: viteEntries,
		},
		rollupOptions: {
			external: [
				"react",
				"react-dom",
				"react/jsx-runtime",
				"react/jsx-dev-runtime",
			],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"react/jsx-runtime": "jsxRuntime",
					"react/jsx-dev-runtime": "jsxRuntime",
				},
				chunkFileNames: "[name].js",
			},
		},
		sourcemap: true,
	},
	resolve: {
		alias: {
			"@repo/utils": join(__dirname, "../utils/src"),
		},
	},
});
