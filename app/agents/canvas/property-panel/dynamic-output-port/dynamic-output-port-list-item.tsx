import {
	type BlueprintPort,
	useDeletePortAction,
	useUpdatePortnameAction,
} from "@/app/agents/blueprints";
import { Button } from "@/components/ui/button";
import { AlignLeftIcon, TrashIcon } from "lucide-react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";

type DynamicOutputPortListItemProps = {
	port: BlueprintPort;
};
export const DynamicOutputPortListItem: FC<DynamicOutputPortListItemProps> = ({
	port,
}) => {
	const [edit, setEdit] = useState(false);
	const [value, setValue] = useState(port.name);
	const ref = useRef<HTMLInputElement>(null);
	const { updatePortName } = useUpdatePortnameAction();
	const { deletePort } = useDeletePortAction();
	useEffect(() => {
		if (edit && ref.current != null) {
			ref.current.focus();
		}
	}, [edit]);
	const handleBlur = useCallback(() => {
		if (value === "") {
			value;
		}
		updatePortName({
			port: {
				...port,
				name: value,
			},
		});
		setEdit(false);
	}, [value, port, updatePortName]);
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
				<input
					type="text"
					className="h-full w-full border border-blue-500 bg-transparent rounded-none focus-visible:outline-none px-1"
					ref={ref}
					onBlur={handleBlur}
					value={value}
					onChange={(e) => {
						setValue(e.target.value);
					}}
				/>
			) : (
				<div className="flex justify-between w-full">
					<span className="cursor-default">{port.name}</span>
					<Button
						size="icon"
						type="button"
						variant="ghost"
						className="hidden group-hover:block"
						onClick={() => {
							deletePort({ port: { id: port.id } });
						}}
					>
						<TrashIcon className="w-4 h-4" />
					</Button>
				</div>
			)}
		</div>
	);
};
