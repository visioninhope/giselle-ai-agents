import { array, number, object, string } from "valibot";

export const dataSchema = object({
	openaiAssistantId: string(),
	knowledgeIds: array(number()),
});
