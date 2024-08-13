import { number, object, string } from "valibot";

export const onRequest = createNodeClass("onRequest", {
	category: "core",
	template: {
		outputPorts: [{ type: "execution", key: "to" }],
	},
});
export const response = createNodeClass("response", {
	category: "core",
	template: {
		inputPorts: [
			{ type: "execution", key: "from" },
			{ type: "data", label: "Output" },
		],
	},
});
export const text = createNodeClass("text", {
	category: "core",
	template: {
		outputPorts: [{ type: "data", key: "text" }],
	},
	dataSchema: object({
		content: string(),
	}),
	defaultData: {
		content: "",
	},
});

export const textGeneration = createNodeClass("textGeneration", {
	category: "core",
	template: {
		inputPorts: [
			{ type: "execution", key: "from" },
			{ type: "data", label: "Instruction", key: "instruction" },
		],
		outputPorts: [
			{ type: "execution", key: "to" },
			{ type: "data", label: "Result" },
		],
	},
});

export const agent = createNodeClass("agent", {
	category: "agent",
	template: {
		inputPorts: [{ type: "execution", key: "from" }],
		outputPorts: [
			{ type: "execution", key: "to" },
			{ type: "data", label: "Result" },
		],
	},
	dataSchema: object({
		relevantAgent: object({
			id: number(),
			blueprintId: number(),
			name: string(),
		}),
	}),
});
