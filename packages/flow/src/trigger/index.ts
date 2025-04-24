import { triggers as githubTriggers } from "./github";
import { triggers as manualTriggers } from "./manual";

export {
	triggers as githubTriggers,
	githubIssueCreatedTrigger,
	githubIssueCommentCreatedTrigger,
} from "./github";

export { triggers as manualTriggers } from "./manual";

export const triggers = [...manualTriggers, ...githubTriggers];
