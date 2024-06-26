export type DataType =
	| "number"
	| "string"
	| "boolean"
	| ((type: DataType) => DataType);
type ExecutionPin = {
	key: string;
	kind: "execution";
	label?: string;
};
type DataPin = {
	key: string;
	kind: "data";
	dataType: DataType;
	label?: string | ((label: string) => string);
};
type ArrayDataPin = {
	key: string;
	kind: "data";
	array: true;
	dataType: DataType;
	label: string;
};
type ElementOfInputDataPin = {
	key: string;
	kind: "data";
	dataType: "elementOfInputData";
	label: string;
	inputPinKey: string;
};
export type InputPin = ExecutionPin | DataPin | ArrayDataPin;
type OutputPin = ExecutionPin | DataPin | ArrayDataPin | ElementOfInputDataPin;

type ActionNodeStructure<Key extends string> = {
	key: Key;
	kind: "action";
	name: string | ((name?: string) => string);
	inputs?: InputPin[];
	outputs?: OutputPin[];
};

type ContextNodeStructure<Key extends string> = {
	key: Key;
	kind: "context";
	name: string;
	outputs?: OutputPin[];
};

type NodeStructure<Key extends string> =
	| ActionNodeStructure<Key>
	| ContextNodeStructure<Key>;

export function createNodeStructure<Key extends string>(
	nodeStructure: NodeStructure<Key>,
) {
	return nodeStructure;
}

export type Context = {
	key: string;
	name: string;
	type: DataType;
	array?: boolean;
};
