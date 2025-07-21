import path from "node:path";

export type Runnable = {
	key: string;
	label: string;
	absPath: string;
	port?: number;
};

const baseDir = process.cwd();
export const runnables: Runnable[] = [
	{
		key: "admin",
		label: "Admin",
		absPath: path.join(baseDir, "apps/admin"),
		port: 3001,
	},
	{
		key: "blog",
		label: "Blog",
		absPath: path.join(baseDir, "apps/blog"),
		port: 3002,
	},
	{
		key: "storefront",
		label: "Storefront",
		absPath: path.join(baseDir, "apps/storefront"),
		port: 3003,
	},
	{
		key: "api",
		label: "API",
		absPath: path.join(baseDir, "apps/api"),
		port: 3004,
	},
	{
		key: "@repo/ui",
		label: "ui",
		absPath: path.join(baseDir, "packages/ui"),
	},
];
