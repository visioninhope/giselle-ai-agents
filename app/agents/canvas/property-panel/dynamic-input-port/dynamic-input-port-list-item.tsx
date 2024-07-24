import {
	type BlueprintPort,
	deletePort,
	updatePortName,
	useBlueprint,
	useBlueprintMutation,
} from "@/app/agents/blueprints";
import { Button } from "@/components/ui/button";
import { AlignLeftIcon, TrashIcon } from "lucide-react";
import {
	type FC,
	type FocusEventHandler,
	type FormEventHandler,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import invariant from "tiny-invariant";

type DynamicInputPortListItemProps = {
	port: BlueprintPort;
};
export const DynamicInputPortListItem: FC<DynamicInputPortListItemProps> = ({
	port,
}) => {
	const blueprint = useBlueprint();
	const [edit, setEdit] = useState(false);
	const ref = useRef<HTMLInputElement>(null);
	const { mutateBlueprint } = useBlueprintMutation();
	useEffect(() => {
		if (edit && ref.current != null) {
			ref.current.focus();
		}
	}, [edit]);
	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		(formEvent) => {
			formEvent.preventDefault();
			const formData = new FormData(formEvent.currentTarget);
			const name = formData.get("name");
			invariant(
				name != null && typeof name === "string",
				"name must be a string",
			);
			mutateBlueprint({
				optimisticAction: {
					type: "updatePortName",
					portId: port.id,
					name,
				},
				mutation: updatePortName({
					port: {
						id: Number.parseInt(port.id, 10),
						name,
					},
				}),
				action: () => ({
					type: "updatePortName",
					portId: port.id,
					name,
				}),
			});
			setEdit(false);
		},
		[mutateBlueprint, port.id],
	);
	const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
		(focusEvent) => {
			if (ref.current == null || ref.current.value === "") {
				setEdit(false);
				return;
			}
			focusEvent.currentTarget.form?.requestSubmit();
		},
		[],
	);
	return (
		<div
			className="flex gap-2 items-center border border-transparent data-[state=show]:hover:border-blue-500 px-4 h-8 py-0.5 group"
			onDoubleClick={() => {
				setEdit(true);
			}}
			data-state={edit ? "edit" : "show"}
		>
			<AlignLeftIcon className="w-4 h-4 flex-shrink-0" />
			{edit ? (
				<form onSubmit={handleSubmit}>
					<input
						type="text"
						className="h-full w-full border border-blue-500 bg-transparent rounded-none focus-visible:outline-none px-1"
						name="name"
						ref={ref}
						onBlur={handleBlur}
						defaultValue={port.name}
					/>
				</form>
			) : (
				<div className="flex justify-between w-full">
					<span className="cursor-default">{port.name}</span>
					<Button
						size="icon"
						type="button"
						variant="ghost"
						className="hidden group-hover:block"
						onClick={() => {
							mutateBlueprint({
								optimisticAction: {
									type: "deletePort",
									deletePortId: port.id,
								},
								mutation: deletePort({
									blueprintId: blueprint.id,
									deletePortId: Number.parseInt(port.id, 10),
								}),
								action: () => ({
									type: "deletePort",
									deletePortId: port.id,
								}),
							});
						}}
					>
						<TrashIcon className="w-4 h-4" />
					</Button>
				</div>
			)}
		</div>
	);
};
