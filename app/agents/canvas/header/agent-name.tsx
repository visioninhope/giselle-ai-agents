import { updateName, useAgent } from "@/app/agents";
import { type FC, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

export const AgentName: FC = () => {
	const { agent } = useAgent();
	const [edit, setEdit] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	if (edit) {
		return (
			<NameField onUpdate={() => setEdit(false)} defaultValue={agent.name} />
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

type NameFieldProps = {
	defaultValue: string | null;
	onUpdate: () => void;
};
const NameField: FC<NameFieldProps> = ({ onUpdate, defaultValue }) => {
	const { agent, mutate } = useAgent();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (inputRef.current == null) {
			return;
		}
		inputRef.current.select();
		inputRef.current.focus();
	}, []);
	return (
		<form
			onSubmit={async (formEvent) => {
				formEvent.preventDefault();
				const formData = new FormData(formEvent.currentTarget);
				const name = formData.get("name");
				/** @todo validation */
				invariant(typeof name === "string", "name must be a string");

				mutate({
					type: "updateAgentName",
					optimisticData: { name },
					action: async (optimisticData) => {
						await updateName({ id: agent.id, name });
						return optimisticData;
					},
				});
				onUpdate();
			}}
		>
			<input
				defaultValue={defaultValue ?? "Untitled"}
				className="outline-none"
				name="name"
				ref={inputRef}
			/>
		</form>
	);
};
