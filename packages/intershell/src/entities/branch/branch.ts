import { $ } from "bun";
import { branchRules } from "./rules";
import type { BranchValidationResult, ParsedBranch } from "./types";

export * from "./types";

export const EntityBranch = {
	parseByName(branchName: string): ParsedBranch {
		const prefix = EntityBranch.extractPrefix(branchName);
		const name = prefix ? branchName.replace(prefix, "") : branchName;

		const rules = branchRules;
		const errors = [];

		for (const rule of rules) {
			const result = rule.validator({ name, prefix });
			if (result !== true) {
				errors.push(result);
			}
		}

		return {
			prefix,
			name,
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

	extractPrefix(name: string): string | undefined {
		if (!name) return undefined;

		const parts = name.split("/");
		return parts[0];
	},
};
