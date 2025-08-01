export type ClicoOption = {
	readonly short?: string;
	readonly long: string;
	readonly description: string;
	readonly required?: boolean;
	readonly examples?: string[];
} & (
	| ({
			type: "boolean";
			multiple: false;
			validator: (value: boolean) => boolean | string;
	  } & (
			| {
					required: false;
					defaultValue: boolean;
			  }
			| {
					required: true;
					defaultValue: undefined;
			  }
	  ))
	| ({
			type: "string";
			multiple: false;
			validator: (value: string) => boolean | string;
	  } & (
			| {
					required: false;
					defaultValue: string;
			  }
			| {
					required: true;
					defaultValue: undefined;
			  }
	  ))
	| ({
			type: "number";
			multiple: false;
			validator: (value: number) => boolean | string;
	  } & (
			| {
					required: false;
					defaultValue: number;
			  }
			| {
					required: true;
					defaultValue: undefined;
			  }
	  ))
	| ({
			type: "string[]";
			multiple: true;
			validator: (value: string[]) => boolean | string;
	  } & (
			| {
					required: false;
					defaultValue: string[];
			  }
			| {
					required: true;
					defaultValue: undefined;
			  }
	  ))
	| ({
			type: "number[]";
			multiple: true;
			validator: (value: number[]) => boolean | string;
	  } & (
			| {
					required: true;
					defaultValue: number[];
			  }
			| {
					required: false;
					defaultValue: undefined;
			  }
	  ))
);

export type ClicoArgName<O extends ClicoOption> = O extends {
	long: `--${infer Name}`;
}
	? Name
	: never;

export type ClicoArgValue<O extends ClicoOption> = O["multiple"] extends true
	? string[]
	: O["type"] extends "boolean"
		? boolean
		: O["type"] extends "number"
			? number
			: O["type"] extends "string[]"
				? string[]
				: O["type"] extends "number[]"
					? number[]
					: string;

export interface ClicoCommand {
	readonly name: string;
	readonly description: string;
	readonly usage: string;
	readonly examples: readonly string[];
	readonly options: readonly ClicoOption[];
	readonly commands?: Record<string, ClicoCommand>;
}

// Enhanced types for better type safety
export type DefaultOptions = {
	verbose: boolean;
	quiet: boolean;
	"dry-run": boolean;
	help: boolean;
};

export type CommandOptions<T extends ClicoCommand> = {
	[K in T["options"][number] as ClicoArgName<K>]: ClicoArgValue<K>;
};

export type NestedOptions<T extends ClicoCommand> = DefaultOptions &
	CommandOptions<T>;

export type NestedArgs<T extends ClicoCommand> = {
	options: NestedOptions<T>;
} & {
	[K in keyof T["commands"]]?: T["commands"] extends Record<
		string,
		ClicoCommand
	>
		? NestedArgs<T["commands"][K]>
		: never;
};

export type ClicoContext<T extends ClicoCommand> = {
	options: NestedOptions<T>;
	xConsole: typeof console;
	isLeaf: boolean;
	input: string;
};

export type ClicoHandler<T extends ClicoCommand> = (context: ClicoContext<T>) =>
	| void
	| Promise<void>
	| (T["commands"] extends Record<string, ClicoCommand>
			? {
					[K in keyof T["commands"]]: ClicoHandler<T["commands"][K]>;
				}
			: never);
