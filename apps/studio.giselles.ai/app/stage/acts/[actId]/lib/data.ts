import {
	isTriggerNode,
	type ManualTriggerParameter,
} from "@giselle-sdk/data-type";
import type { Act } from "@giselle-sdk/giselle";
import { giselleEngine } from "@/app/giselle-engine";
import { fetchUserTeams } from "@/services/teams";

interface ActMetadata {
	appName: string;
	teamName: string;
	triggerParameters: ManualTriggerParameter[];
}

/**
 * Fetch comprehensive act metadata including workspace and team information
 */
export async function fetchActMetadata(act: Act): Promise<ActMetadata> {
	const defaultMetadata: ActMetadata = {
		appName: "Untitled App",
		teamName: "Personal Team",
		triggerParameters: [],
	};

	if (!act.workspaceId) {
		return defaultMetadata;
	}

	try {
		const [workspace, teams] = await Promise.allSettled([
			giselleEngine.getWorkspace(act.workspaceId, true),
			fetchUserTeams(),
		]);

		const result: ActMetadata = { ...defaultMetadata };

		// Process workspace data
		if (workspace.status === "fulfilled" && workspace.value) {
			result.appName = workspace.value.name || defaultMetadata.appName;

			// Get trigger parameters
			const triggerParams = await fetchTriggerParameters(workspace.value);
			result.triggerParameters = triggerParams;
		}

		// Process team data
		if (teams.status === "fulfilled" && teams.value?.length > 0) {
			result.teamName = teams.value[0].name || defaultMetadata.teamName;
		}

		return result;
	} catch (error) {
		console.warn("Failed to fetch act metadata:", error);
		return defaultMetadata;
	}
}

/**
 * Extract trigger parameters from workspace
 */
async function fetchTriggerParameters(workspace: {
	nodes: unknown[];
}): Promise<ManualTriggerParameter[]> {
	try {
		const triggerNode = workspace.nodes.find((node) => isTriggerNode(node));

		if (
			!triggerNode ||
			triggerNode.content.provider !== "manual" ||
			triggerNode.content.state.status !== "configured"
		) {
			return [];
		}

		const flowTrigger = await giselleEngine.getTrigger({
			flowTriggerId: triggerNode.content.state.flowTriggerId,
		});

		if (flowTrigger?.configuration.provider === "manual") {
			return flowTrigger.configuration.event.parameters || [];
		}

		return [];
	} catch (error) {
		console.warn("Failed to fetch trigger parameters:", error);
		return [];
	}
}
