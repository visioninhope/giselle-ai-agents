import { createIdGenerator } from "@giselle-sdk/utils";
import type { z } from "zod/v4";

export const RunId = createIdGenerator("rn");
export type RunId = z.infer<typeof RunId.schema>;
