import { $ } from "bun";
import { findCommand } from "./command-finder";
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
export async function getAffectedPackages(): Promise<string[]> {
	const turboPath = await findCommand("turbo");

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
