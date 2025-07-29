import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	// Addons seem to be causing issues with the new version of storybook
	addons: [],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	core: {
		disableTelemetry: true,
	},
	typescript: {
		check: false,
		reactDocgen: "react-docgen-typescript",
		reactDocgenTypescriptOptions: {
			shouldExtractLiteralValuesFromEnum: true,
			propFilter: (prop) =>
				prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
		},
	},
	async viteFinal(config) {
		if (config.server) {
			config.server.host = "0.0.0.0";
			config.server.allowedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "ui"];
		}
		return config;
	},
};

export default config;
