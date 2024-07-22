import { useBlueprintId, useRequestInterface } from "@/app/agents/blueprints";
import { createRequest } from "@/app/agents/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { PlayIcon } from "lucide-react";
import { type FC, type FormEventHandler, useCallback, useState } from "react";

type RequestButtonProps = {
	onClick: () => void;
};
export const RequestButton: FC<RequestButtonProps> = ({ onClick }) => {
	const [disclosure, setDisclosure] = useState(false);
	const requestInterface = useRequestInterface();
	const blueprintId = useBlueprintId();
	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>((e) => {
		setDisclosure(false);
	}, []);
	const createRequestWithBlueprintId = createRequest.bind(null, blueprintId);
	if (requestInterface?.input == null || requestInterface.input.length < 1) {
		return (
			<form action={createRequestWithBlueprintId}>
				<Button
					variant={"ghost"}
					size={"xs"}
					className="text-muted-foreground"
					type="submit"
				>
					<PlayIcon className="mr-1 w-3 h-3" />
					Request to Agent
				</Button>
			</form>
		);
	}
	return (
		<Popover open={disclosure} onOpenChange={setDisclosure}>
			<PopoverTrigger asChild>
				<Button variant={"ghost"} size={"xs"} className="text-muted-foreground">
					<PlayIcon className="mr-1 w-3 h-3" />
					Request to Agent
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start">
				<form
					action={createRequestWithBlueprintId}
					onSubmit={handleSubmit}
					className="flex flex-col gap-4"
				>
					<div className="flex flex-col gap-2">
						{requestInterface?.input.map(({ portId, name }) => (
							<div key={portId}>
								<Label htmlFor={`${portId}`}>{name}</Label>
								<Input type="text" id={`${portId}`} name={name} />
							</div>
						))}
					</div>
					<Button type="submit">Request</Button>
				</form>
			</PopoverContent>
		</Popover>
	);
};
