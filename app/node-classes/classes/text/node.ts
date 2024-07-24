import type { Feature, Port, Property } from "../../type";

export const name = "text";

export const label = "Text";

export const outputPorts: Port[] = [
	{ type: "data", label: "Text", key: "text-output" },
];

export const properties: Property[] = [{ name: "text", label: "Text" }];

export const propertyPortMap = {
	text: "text-output",
};

export const features: Feature[] = [{ name: "dynamicInputPort" }];
