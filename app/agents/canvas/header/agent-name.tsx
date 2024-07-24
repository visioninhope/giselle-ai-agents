import { useAgent } from "@/app/agents/contexts";
import { type FC, useEffect, useRef, useState } from "react";

export const AgentName: FC = () => {
	const agent = useAgent();
	const [edit, setEdit] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (!edit || inputRef.current == null) {
			return;
		}
		inputRef.current.select();
		inputRef.current.focus();
	}, [edit]);

	if (edit) {
		return (
			<input
				defaultValue={agent.name ?? "Untitled"}
				className="outline-none"
				ref={inputRef}
			/>
		);
	}
	return (
		<button
			className="cursor-default"
			onClick={() => {
				setEdit(true);
			}}
			type="button"
		>
			{agent.name ?? "Untitled"}
		</button>
	);
};
