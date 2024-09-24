export type Parameter<TProperties extends Record<string, Parameter> = any> =
	| {
			type: "object";
			label?: string;
			properties: TProperties;
			required?: Array<keyof TProperties>;
	  }
	| { type: "array"; label?: string; items?: Parameter }
	| { type: "string"; label?: string }
	| { type: "number"; label?: string }
	| { type: "boolean"; label?: string };

function createParameter<T extends Record<string, any>>(
	parameter: Parameter<T>,
) {
	return parameter;
}

export const nodeArchetypes = {
	action: "action",
	data: "data",
} as const;
type NodeArchetype = (typeof nodeArchetypes)[keyof typeof nodeArchetypes];

export type GiselleNodeType<
	TName extends string,
	TParameter extends Record<string, any>,
> = {
	name: TName;
	archetype: NodeArchetype;
	parameters: TParameter;
};

function createGiselleNode<
	TName extends string,
	TParameter extends Record<string, any>,
>(tool: GiselleNodeType<TName, TParameter>) {
	return tool;
}

export const textGenerator = createGiselleNode({
	name: "textGenerator",
	archetype: nodeArchetypes.action,
	parameters: createParameter({
		type: "object",
		properties: {
			input: createParameter({ type: "string", label: "Input" }),
			instruction: createParameter({ type: "string", label: "Instruction" }),
		},
		required: ["instruction"],
	}),
});

export const prompt = createGiselleNode({
	name: "textEditor",
	archetype: nodeArchetypes.data,
	parameters: {},
});

textGenerator.parameters.type;
