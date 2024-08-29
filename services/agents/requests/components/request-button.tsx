"use client";

import { SubmitButton } from "@/components/ui/submit-button";
import { type FC, useCallback } from "react";
import { useRequest } from "../contexts/request-provider";

export const RequestButton: FC = () => {
	const { requestStart } = useRequest();
	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			requestStart();
		},
		[requestStart],
	);
	return (
		<form onSubmit={handleSubmit}>
			<SubmitButton pendingNode={"Requesting..."}>Request</SubmitButton>
		</form>
	);
};
