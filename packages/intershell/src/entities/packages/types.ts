export interface PackageDependencyGraph {
	readonly packages: string[];
	readonly dependencies: Record<string, string[]>;
	readonly devDependencies: Record<string, string[]>;
	readonly peerDependencies: Record<string, string[]>;
	readonly order: string[];
	readonly cycles: string[][];
}

export interface PackageJson {
	name: string;
	version: string;
	description?: string;
	main?: string;
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	author?: string;
	license?: string;
	repository?: string | RepositoryInfo;
	bugs?: string | BugsInfo;
	homepage?: string;
	keywords?: string[];
	private?: boolean;
	workspaces?: string[];
	[key: string]: unknown;
}

export interface RepositoryInfo {
	type: string;
	url: string;
}

export interface BugsInfo {
	url: string;
	email?: string;
}

export interface PackageValidationResult {
	readonly isValid: boolean;
	readonly errors: PackageValidationError[];
}

export interface PackageValidationError {
	readonly code: string;
	readonly message: string;
	readonly field?: string;
}
