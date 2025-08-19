import { NodeGenerationIndex } from "../../../concepts/generation";
import type { ActId } from "../../../concepts/identifiers";
import { actGenerationIndexesPath } from "../../../concepts/path";
import type { GiselleStorage } from "../../experimental_storage";

export async function getActGenerationIndexes(args: {
	actId: ActId;
	experimental_storage: GiselleStorage;
}) {
	if (
		!(await args.experimental_storage.exists(
			actGenerationIndexesPath(args.actId),
		))
	) {
		return undefined;
	}
	return await args.experimental_storage.getJson({
		path: actGenerationIndexesPath(args.actId),
		schema: NodeGenerationIndex.array(),
	});
}
