import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

type DirectoryPath = string;

export async function getAllDirectories(baseDir?: DirectoryPath): Promise<DirectoryPath[]> {
	const projectRoot = baseDir ?? join(import.meta.dir, "../..");

	const discoverDirectories = (dir: DirectoryPath, depth = 0): DirectoryPath[] => {
		if (depth > 3) return [];

		try {
			return readdirSync(dir)
				.map((item) => ({ name: item, path: join(dir, item) }))
				.flatMap(({ name, path }) => {
					const results: DirectoryPath[] = [];

					const [, , category, , packagePath] = path.split("/");
					if (category !== "node_modules" && packagePath === "package.json") {
						const basePath = path.replace(/\/package\.json$/, "");
						results.push(basePath);
					}

					try {
						if (statSync(path).isDirectory()) {
							if (["apps", "packages"].includes(name)) {
								results.push(path);
							}
							results.push(...discoverDirectories(path, depth + 1));
						}
					} catch {
						return [];
					}

					return results;
				});
		} catch {
			return [];
		}
	};

	return discoverDirectories(projectRoot);
}

export async function getAllDirectoryNames(): Promise<string[]> {
	const directories = await getAllDirectories();
	const result = directories
		.map((dir) =>
			dir
				.replace(`${process.cwd()}/`, "")
				.replace("packages", "root")
				.replace("apps", "")
				.replace(/^\//, "")
				.replace("root/", "@repo/"),
		)
		.filter(Boolean);
	return result
		.sort((a, b) => {
			if (b.startsWith("root") && !a.startsWith("root")) return -1;
			if (b.startsWith("@repo") && !a.startsWith("@repo")) return 1;
			return b.toLowerCase().localeCompare(a.toLowerCase());
		})
		.reverse();
}
