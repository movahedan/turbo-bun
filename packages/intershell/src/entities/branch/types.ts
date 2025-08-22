type Validator = (branch: ParsedBranch) => true | string;

export interface BranchConfig {
	readonly protectedBranches: readonly string[];
	readonly prefix: {
		readonly list: readonly string[];
		readonly validator?: Validator;
	};
	readonly name: {
		readonly minLength: number;
		readonly maxLength: number;
		readonly allowedCharacters: RegExp;
		readonly noConsecutiveSeparators: boolean;
		readonly noLeadingTrailingSeparators: boolean;
	};
}

export interface ParsedBranch {
	readonly name: string;
	readonly prefix?: string;
}

export interface BranchValidationResult {
	readonly isValid: boolean;
	readonly errors: string[];
}

export interface BranchRule {
	readonly section: string;
	readonly question: string;
	readonly validator: Validator;
	readonly list?: readonly string[];
}
