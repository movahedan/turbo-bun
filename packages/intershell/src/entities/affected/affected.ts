import { $ } from "bun";
import { EntityTag } from "../tag";

export const EntityAffected = {
	async getAffectedPackages(baseSha?: string, to = "HEAD"): Promise<string[]> {
		const fromSha = await EntityTag.getBaseTagSha(baseSha);

		const affected = await $`bunx turbo run build --filter="...[${fromSha}...${to}]" --dry-run=json`
			.quiet()
			.json();

		return affected.packages.slice(1);
	},
};
