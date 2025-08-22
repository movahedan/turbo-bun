import { $ } from "bun";
import { branchRules } from "./rules";
import type { BranchValidationResult, ParsedBranch } from "./types";

export * from "./types";

export const EntityBranch = {
	parseByName(branchName: string): ParsedBranch {
		const [prefix, ...name] = branchName.split("/");
		return {
			prefix,
			name: name.join("/"),
		};
	},

	validate(branch: string | ParsedBranch): BranchValidationResult {
		const parsedBranch = typeof branch === "string" ? EntityBranch.parseByName(branch) : branch;
		const rules = branchRules;
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
