import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpenIcon, TrashIcon, UploadIcon } from "lucide-react";

import type { FC } from "react";

const knowledges = [
	{
		id: "k1",
		name: "General Knowledge",
		files: [
			{ id: "f1", name: "file1.txt" },
			{ id: "f2", name: "file2.pdf" },
		],
	},
	{
		id: "k2",
		name: "Technical Document",

		files: [
			{ id: "f1", name: "doc.md" },
			{ id: "f2", name: "tech.txt" },
		],
	},
];
export const KnowledgeAccordion: FC = () => {
	return (
		<div className="px-4 py-2 gap-4 flex flex-col">
			<Accordion type="single" collapsible className="w-full">
				{knowledges.map(({ id, name, files }) => (
					<AccordionItem value={id} key={id}>
						<AccordionTrigger handlePosition="right" className="flex gap-2">
							<BookOpenIcon className="w-4 h-4" />
							<p>{name}</p>
						</AccordionTrigger>
						<AccordionContent className="flex flex-col gap-2">
							<ul className="list-disc list-inside">
								{files.map(({ id, name }) => (
									<li
										key={id}
										className="flex items-center justify-between py-1"
									>
										<span>{name}</span>
										<Button variant="ghost" size="sm">
											<TrashIcon className="h-4 w-4" />
										</Button>
									</li>
								))}
							</ul>
							<div>
								<Button size="sm" variant="secondary" className="gap-2">
									<UploadIcon className="w-4 h-4" />
									<p>Add Content</p>
								</Button>
							</div>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>

			<Card>
				<CardHeader>
					<CardTitle>Add Knowledge</CardTitle>
					<CardDescription>
						Create a new knowledge to categorize related information.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<Input name="name" data-1p-ignore />
						<Button size="sm">Add</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
