import { useBlueprint } from "@/app/agents/blueprints";
import { type RequestParameter, createRequest } from "@/app/agents/requests";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlayIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	type FC,
	type FormEventHandler,
	useCallback,
	useState,
	useTransition,
} from "react";

export const RequestButton: FC = () => {
	const [disclosure, setDisclosure] = useState(false);
	const router = useRouter();
	const { blueprint } = useBlueprint();
	const [isPending, startTransition] = useTransition();
	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		(formEvent) => {
			formEvent.preventDefault();
			const formData = new FormData(formEvent.currentTarget);

			const requestParameters: RequestParameter[] = [];
			for (const [portId, message] of formData.entries()) {
				requestParameters.push({
					port: {
						id: Number.parseInt(portId, 10),
					},
					message: message.toString(),
				});
			}
			startTransition(async () => {
				const { requestId } = await createRequest(
					blueprint.id,
					requestParameters,
				);
				router.push(`/agents/${blueprint.agent.urlId}/requests/${requestId}`);
			});
			setDisclosure(false);
		},
		[router, blueprint.id, blueprint.agent.urlId],
	);

	if (isPending) {
		return <div className="px-4 text-muted-foreground">loading...</div>;
	}
	if (
		blueprint.requestInterface?.input == null ||
		blueprint.requestInterface.input.length < 1
	) {
		<form onSubmit={handleSubmit}>
			<Button type="submit">
				<PlayIcon className="mr-1 w-3 h-3" />
				Request to Agent!
			</Button>
		</form>;
	}
	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				{blueprint.requestInterface?.input.map(({ portId, name }) => (
					<div key={portId}>
						<Label htmlFor={`${portId}`}>{name}</Label>
						<Textarea id={`${portId}`} name={portId} required />
					</div>
				))}
			</div>
			<Button type="submit">Request</Button>
		</form>
	);
};
