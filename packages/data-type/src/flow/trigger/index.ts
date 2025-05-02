import { createIdGenerator } from "@giselle-sdk/utils";
import type { z } from "zod";
export { GitHubTrigger } from "./github";

export const FlowTriggerId = createIdGenerator("fltg");
export type FlowTriggerId = z.infer<typeof FlowTriggerId.schema>;
