import { getKnowledges } from "../../../knowledges";
import type { AgentId } from "../../../types";
import { AddContentStateProvider } from "./add-content-state-provider";
import { KnowledgeList } from "./knowledge-list";

type KnowledgesProps = {
	agentId: AgentId;
};
export const Knowledges = async ({ agentId }: KnowledgesProps) => {
	const knowledges = await getKnowledges(agentId);
	return <KnowledgeList knowledges={knowledges} />;
};
