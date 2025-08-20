import type { PRCategory, PRInfo } from "./pr.types";

export type CommitMessageData =
	| {
			type: "other";
			scopes?: string[];
			description: string;
			bodyLines: string[];
			isBreaking: boolean;
			isMerge: boolean;
			isDependency: boolean;
	  }
	| {
			type: string;
			scopes?: string[];
			description: string;
			bodyLines: string[];
			isBreaking: boolean;
			isMerge: boolean;
			isDependency: boolean;
	  };

export interface ParsedCommitData {
	message: CommitMessageData;
	info?: {
		hash: string;
		author?: string;
		date?: string;
	};
	pr?: PRInfo;
}

type Section = keyof CommitMessageData;
export type CommitRule = {
	enabled?: boolean;
	section: Section;
	question: string;
	validator: (message: ParsedCommitData) => true | string;
	list?: string[];
};
export type CommitRules = Record<Section, CommitRule>;

type Validator = (commit: ParsedCommitData) => true | string;

export interface CommitConfig
	extends Partial<
		Record<
			Section,
			{
				validator?: Validator;
			}
		>
	> {
	type?: {
		list?: CommitTypeDefinition[];
		validator?: Validator;
	};
	scopes?: {
		list?: string[];
		validator?: Validator;
	};
	description?: {
		minLength?: number;
		maxLength?: number;
		shouldNotEndWithPeriod?: boolean;
		shouldNotStartWithType?: boolean;
		validator?: Validator;
	};
	bodyLines?: {
		minLength?: number;
		maxLength?: number;
		validator?: Validator;
	};
	isBreaking?: {
		validator?: Validator;
	};
	isMerge?: {
		validator?: Validator;
	};
	isDependency?: {
		validator?: Validator;
	};
}

export interface CommitTypeDefinition {
	readonly type: string;
	readonly label: string;
	readonly description: string;
	readonly category: PRCategory;
	readonly emoji: string;
	readonly badgeColor: string;
	readonly breakingAllowed: boolean;
}
