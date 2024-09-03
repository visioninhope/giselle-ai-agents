"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { createId } from "@paralleldrive/cuid2";
import { type FC, useActionState } from "react";
import { type Knowledge, addKnowledge } from "../../knowledges";
import { usePlayground } from "../context";

type KnowledgeListProps = {
	knowledges: Knowledge[];
};
export const KnowledgeList: FC<KnowledgeListProps> = ({ knowledges }) => {
	return (
		<div className="flex flex-col gap-8">
			<Accordion type="multiple">
				{knowledges.map((knowledge) => (
					<AccordionItem key={knowledge.id} value={knowledge.id}>
						<AccordionTrigger> {knowledge.name}</AccordionTrigger>
						<AccordionContent>
							<div>Knowledge</div>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>

			<AddKnowledgeForm />
		</div>
	);
};

type AddKnowledgeError = string;
export const AddKnowledgeForm: FC = () => {
	const { state } = usePlayground();
	const [error, action] = useActionState(
		async (prevState: AddKnowledgeError | null, formData: FormData) => {
			const name = formData.get("name");
			if (typeof name !== "string") {
				return "invalid type";
			}
			if (name.length === 0) {
				return "name is required";
			}
			await addKnowledge(state.agentId, {
				id: `knwl_${createId()}`,
				name,
			});
			return null;
		},
		null,
	);
	return (
		<Card>
			<CardHeader>
				<CardTitle>Add Knowledge</CardTitle>
				<CardDescription>
					Create a new knowledge to categorize related information.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="flex items-center gap-4" action={action}>
					<Input name="name" data-1p-ignore />
					<SubmitButton size="sm">Add</SubmitButton>
				</form>
			</CardContent>
		</Card>
	);
};
