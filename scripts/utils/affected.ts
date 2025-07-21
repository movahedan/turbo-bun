import { $ } from "bun";
import { type Runnable, runnables } from "./config";

/* Sample output of turbo command:
  {
    ...,
    "packages": [
      "//", // root package
      "@repo/<package-name>", // affected package
    ],
		...
  }
*/
async function getAffectedPackages(): Promise<string[]> {
	const turboPath = `${process.cwd()}/node_modules/.bin/turbo`;
	const affectedPackages =
		await $`${turboPath} run build --filter="...[origin/main]" --dry-run=json`
			.quiet()
			.json();

	// Remove root package
	return affectedPackages.packages.slice(1);
}

export async function getAffectedRunnables(): Promise<Runnable[]> {
	const keys = await getAffectedPackages();

	return runnables.filter(({ key }) => keys.some((k: string) => key === k));
}
