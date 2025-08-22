import type { TagConfig, TagRule } from "./types";

const defaultConfig: TagConfig = {
	format: {
		list: ["semver"] as const,
	},
	prefix: {
		list: ["v"] as const,
	},
	name: {
		minLength: 1,
		maxLength: 100,
		allowedCharacters: /^[a-zA-Z0-9\-_.]+$/,
		noSpaces: true,
		noSpecialChars: true,
	},
};

class TagRules {
	private config: TagConfig;
	private rules: TagRule[] = [];

	constructor(config: TagConfig = defaultConfig) {
		this.config = this.mergeConfig(config);
		this.rules = this.createRules();
	}

	getRules(): TagRule[] {
		return this.rules;
	}

	getConfig(): TagConfig {
		return this.config;
	}

	private mergeConfig(config: Partial<TagConfig>): TagConfig {
		return {
			...defaultConfig,
			...config,
			prefix: {
				...defaultConfig.prefix,
				...config.prefix,
			},
			name: {
				...defaultConfig.name,
				...config.name,
			},
		};
	}

	private createRules(): TagRule[] {
		const config = this.config;
		return [
			{
				section: "format",
				question: `🏷️ What format is this tag?\n=> [${config.format.list.join(", ")}]`,
				validator: (tag) => {
					const format = tag.format;
					if (config.format.list.length === 0) return true;
					const exists = format ? config.format.list.includes(format) : true;
					return (
						exists ||
						`invalid format: "${format}". valid formats:\n  => ${config.format.list.join(", ")}`
					);
				},
				list: config.format.list,
			},
			{
				section: "prefix",
				question: `🏷️ What prefix is this tag?\n=> [${config.prefix.list.join(", ")}]`,
				validator: (tag): true | string => {
					const prefix = tag.prefix;
					if (config.prefix.list.length === 0) return true;
					const exists = prefix ? config.prefix.list.includes(prefix) : true;

					return (
						config.prefix.validator?.(tag) ||
						exists ||
						`invalid prefix: "${prefix}". valid prefixes: ${config.prefix.list.join(", ")}`
					);
				},
				list: config.prefix.list,
			},
			{
				section: "name",
				question: "📝 Tag name validation",
				validator: (tag): true | string => {
					const name = tag.name;
					const length = name.length;

					// Check length
					if (length < config.name.minLength) {
						return `tag name should be at least ${config.name.minLength} characters long`;
					}
					if (length > config.name.maxLength) {
						return `tag name should be max ${config.name.maxLength} characters, received: ${length}`;
					}

					// Check allowed characters
					if (!config.name.allowedCharacters.test(name)) {
						return "tag name can only contain letters, numbers, hyphens, underscores, and dots";
					}

					// Check no spaces
					if (config.name.noSpaces && /\s/.test(name)) {
						return "tag name cannot contain spaces";
					}

					// Check no special characters
					if (config.name.noSpecialChars && /[^a-zA-Z0-9\-_.]/.test(name)) {
						return "tag name contains invalid special characters";
					}

					return true;
				},
			},
		];
	}
}

export const tagRules = new TagRules(defaultConfig);
