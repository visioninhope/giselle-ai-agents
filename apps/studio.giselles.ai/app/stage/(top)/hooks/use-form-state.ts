import type { FlowTriggerId } from "@giselle-sdk/data-type";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FlowTriggerUIItem, ValidationErrors } from "../types";

interface UseFormStateProps {
	filteredFlowTriggers: FlowTriggerUIItem[];
}

export function useFormState({ filteredFlowTriggers }: UseFormStateProps) {
	const searchParams = useSearchParams();
	const urlWorkspaceId = searchParams.get("workspaceId");

	const [selectedFlowTriggerId, setSelectedFlowTriggerId] = useState<
		FlowTriggerId | undefined
	>(undefined);
	const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
		{},
	);

	const initializedRef = useRef(false);
	const userHasSelectedRef = useRef(false);

	// Pre-select flow trigger based on URL workspace ID (only once on initial load and if user hasn't manually selected)
	useEffect(() => {
		if (
			!initializedRef.current &&
			!userHasSelectedRef.current &&
			filteredFlowTriggers.length > 0
		) {
			if (urlWorkspaceId) {
				const matchingTrigger = filteredFlowTriggers.find(
					(trigger) => trigger.sdkData.workspaceId === urlWorkspaceId,
				);
				if (matchingTrigger) {
					setSelectedFlowTriggerId(matchingTrigger.id);
					// Don't mark as user-selected for auto-selection from URL
				}
			}
			initializedRef.current = true;
		}
	}, [filteredFlowTriggers, urlWorkspaceId]);

	const selectedTrigger = useMemo(
		() =>
			filteredFlowTriggers.find(
				(flowTrigger) => flowTrigger.id === selectedFlowTriggerId,
			),
		[filteredFlowTriggers, selectedFlowTriggerId],
	);

	const handleFlowTriggerSelect = (triggerId: FlowTriggerId) => {
		userHasSelectedRef.current = true;
		if (selectedFlowTriggerId === triggerId) {
			setSelectedFlowTriggerId(undefined);
		} else {
			setSelectedFlowTriggerId(triggerId);
		}
	};

	const handleFlowTriggerDeselect = () => {
		userHasSelectedRef.current = true;
		setSelectedFlowTriggerId(undefined);
	};

	return {
		selectedFlowTriggerId,
		setSelectedFlowTriggerId,
		selectedTrigger,
		validationErrors,
		setValidationErrors,
		userHasSelectedRef,
		handleFlowTriggerSelect,
		handleFlowTriggerDeselect,
	};
}
