import { $ } from "bun";
import { BranchRules } from "./rules";
import type { BranchConfig, BranchRule, BranchValidationResult, ParsedBranch } from "./types";

export * from "./types";

const branchRules = new BranchRules();

export const EntityBranch = {
	parseByName(branchName: string): ParsedBranch {
		const [prefix, ...name] = branchName.split("/");
		return {
			prefix,
			name: name.join("/"),
		};
	},

	getConfig(): BranchConfig {
		return branchRules.getConfig();
	},

	getRules(): BranchRule[] {
		return branchRules.getRules();
	},

	validate(branch: string | ParsedBranch): BranchValidationResult {
		const parsedBranch = typeof branch === "string" ? EntityBranch.parseByName(branch) : branch;
		const rules = EntityBranch.getRules();
		const errors = [];

		for (const rule of rules) {
			const result = rule.validator(parsedBranch);
			if (result !== true) {
				errors.push(result);
			}
		}

		return { isValid: errors.length === 0, errors };
	},

	async getCurrentBranch(): Promise<string> {
		const result = await $`git branch --show-current`;
		return result.stdout.toString().trim();
	},
};
