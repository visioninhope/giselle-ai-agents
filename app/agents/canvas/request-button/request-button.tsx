import { useRequestInterface } from "@/app/agents/blueprints";
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
	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		(e) => {
			e.preventDefault();
			setDisclosure(false);
			onClick();
		},
		[onClick],
	);
	if (requestInterface?.input == null || requestInterface.input.length < 1) {
		return (
			<Button
				variant={"ghost"}
				size={"xs"}
				className="text-muted-foreground"
				onClick={onClick}
			>
				<PlayIcon className="mr-1 w-3 h-3" />
				Request to Agent
			</Button>
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
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						{requestInterface?.input.map(({ portId, name }) => (
							<div key={portId}>
								<Label htmlFor={`${portId}`}>{name}</Label>
								<Input type="text" id={`${portId}`} />
							</div>
						))}
					</div>
					<Button type="submit">Request</Button>
				</form>
			</PopoverContent>
		</Popover>
	);
};
