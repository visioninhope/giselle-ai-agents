import { useBlueprint } from "@/app/agents/blueprints";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	type FC,
	type FormEventHandler,
	useCallback,
	useState,
	useTransition,
} from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const RequestButton: FC = () => {
	const [disclosure, setDisclosure] = useState(false);
	const router = useRouter();
	const blueprint = useBlueprint();
	const [isPending, startTransition] = useTransition();
	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		(formEvent) => {
			formEvent.preventDefault();
			startTransition(async () => {
				const requestId = await createRequest(
					blueprint.id,
					new FormData(formEvent.currentTarget),
				);
				router.push(`/agents/yv2jg5xmbsmr1z1unatqpgt9/requests/${requestId}`);
			});
			setDisclosure(false);
		},
		[router, blueprint.id],
	);
	const createRequestWithBlueprintId = createRequest.bind(null, blueprint.id);
	if (
		blueprint.requestInterface?.input == null ||
		blueprint.requestInterface.input.length < 1
	) {
		return isPending ? (
			<div className="px-4 text-muted-foreground">loading...</div>
		) : (
			<form onSubmit={handleSubmit}>
				{/*<Link href="/agents/yv2jg5xmbsmr1z1unatqpgt9/requests/2">*/}
				<Button type="submit">
					<PlayIcon className="mr-1 w-3 h-3" />
					Request to Agent!
				</Button>
				{/* </Link> */}
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
						{blueprint.requestInterface?.input.map(({ portId, name }) => (
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
