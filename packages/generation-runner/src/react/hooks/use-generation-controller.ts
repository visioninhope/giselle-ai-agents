import { useGenerationRunnerSystem } from "../contexts/generation-runner-system";
export function useGenerationController() {
	const { startGeneration } = useGenerationRunnerSystem();
	return { startGeneration };
}
