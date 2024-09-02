import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createTemporaryId } from "@/lib/create-temporary-id";
import {
	BookOpenIcon,
	HardDriveUploadIcon,
	TextIcon,
	TrashIcon,
	UploadIcon,
} from "lucide-react";
// import {
// 	addContentToKnowledge,
// 	createKnowledge,
// } from "../../knowledges/actions";

import { SubmitButton } from "@/components/ui/submit-button";
import { createId } from "@paralleldrive/cuid2";
import { type FC, useState } from "react";
import invariant from "tiny-invariant";
import { addKnowledgeToDb } from "../../knowledges/actions/add-knowledge-to-db";
import { useKnowledges } from "../../knowledges/context";
import type { AsyncKnowledgeAction } from "../../knowledges/reducer";
import {
	type File,
	type Knowledge,
	type KnowledgeContent,
	type KnowledgeId,
	knowledgeContentStatus,
} from "../../knowledges/types";
import type { AgentId } from "../../types";
import { usePlayground } from "../playground-context";

const upperCaseFirstLetter = (str: string) =>
	str.charAt(0).toUpperCase() + str.slice(1);

export const addKnowledge = (
	agentId: AgentId,
	knowledge: Knowledge,
): AsyncKnowledgeAction => {
	return async (dispatch) => {
		// dispatch({ type: "SET_ADDING_KNOWLEDGE" });
		await addKnowledgeToDb(agentId, knowledge);
		dispatch({ type: "ADD_KNOWLEDGE", knowledge });
	};
};

// type ContentUploaderProps = {
// 	knowledgeId: KnowledgeId;
// };
// const ContentUploader: FC<ContentUploaderProps> = ({ knowledgeId }) => {
// 	const { dispatch } = useKnowledges();
// 	const [open, setOpen] = useState(false);
// 	return (
// 		<Popover open={open} onOpenChange={setOpen}>
// 			<PopoverTrigger asChild>
// 				<Button size="sm" variant="secondary" className="gap-2">
// 					<UploadIcon className="w-4 h-4" />
// 					<p>Add Content</p>
// 				</Button>
// 			</PopoverTrigger>
// 			<PopoverContent className="p-0 w-[200px]" align="end">
// 				<Command>
// 					<CommandList>
// 						<CommandGroup>
// 							<CommandItem>
// 								<form>
// 									<label className="flex items-center gap-2">
// 										<input
// 											type="file"
// 											name="file"
// 											className="hidden"
// 											onChange={(e) => {
// 												e.preventDefault();
// 												setOpen(false);
// 												if (e.target.files == null) {
// 													return;
// 												}
// 												const file = {
// 													id: `fl_${createId()}`,
// 												} satisfies File;
// 												const knowledgeContent = {
// 													id: `knwl.cnt_${createId()}`,
// 													name: e.target.files[0].name,
// 													status: knowledgeContentStatus.inProgress,
// 													file,
// 												} satisfies KnowledgeContent;
// 												dispatch({
// 													type: "ADD_CONTENT",
// 													knowledgeId,
// 													content: knowledgeContent,
// 												});
// 											}}
// 										/>
// 										<HardDriveUploadIcon className="w-4 h-4" />
// 										<p>Upload from device</p>
// 									</label>
// 								</form>
// 							</CommandItem>
// 							<CommandItem>
// 								<Dialog>
// 									<DialogTrigger asChild>
// 										<button type="button" className="flex items-center gap-2">
// 											<TextIcon className="w-4 h-4" />
// 											<p>Add text conent</p>
// 										</button>
// 									</DialogTrigger>
// 									<DialogContent>
// 										<form
// 											onSubmit={(e) => {
// 												e.preventDefault();
// 												const formData = new FormData(e.currentTarget);
// 												const title = formData.get("title");
// 												const body = formData.get("body");
// 												invariant(
// 													typeof title === "string" && title.length > 0,
// 													"Title is required",
// 												);
// 												invariant(
// 													typeof body === "string" && body.length > 0,
// 													"Body is required",
// 												);

// 												const content = `# ${title}\n\n${body}`;
// 												const blob = new Blob([content], {
// 													type: "text/markdown",
// 												});
// 												const file = new File([blob], `${title}.md`, {
// 													type: "text/markdown",
// 												});
// 												mutate({
// 													type: "addContentToKnowledge",
// 													optimisticData: {
// 														knowledgeId,
// 														content: {
// 															type: "text",
// 															isCreating: true,
// 															id: createTemporaryId(),
// 															name: title,
// 															status: "in_progress",
// 															openaiVectorStoreFileId: "",
// 															file: {
// 																openaiFileId: "",
// 																id: createTemporaryId(),
// 															},
// 														},
// 													},
// 													action: () =>
// 														addContentToKnowledge({
// 															knowledgeId,
// 															content: {
// 																type: "text",
// 																name: title,
// 																file,
// 															},
// 														}),
// 												});
// 											}}
// 										>
// 											<DialogHeader>
// 												<DialogTitle>Add text content</DialogTitle>
// 											</DialogHeader>
// 											<div className="grid gap-4 py-4">
// 												<div className="flex flex-col gap-4">
// 													<Label htmlFor="title">Title</Label>
// 													<Input id="title" name="title" />
// 												</div>
// 												<div className="flex flex-col gap-4">
// 													<Label htmlFor="content">Content</Label>
// 													<Textarea id="content" name="body" rows={10} />
// 												</div>
// 											</div>
// 											<DialogFooter>
// 												<Button type="submit">Add Content</Button>
// 											</DialogFooter>
// 										</form>
// 									</DialogContent>
// 								</Dialog>
// 							</CommandItem>
// 						</CommandGroup>
// 					</CommandList>
// 				</Command>
// 			</PopoverContent>
// 		</Popover>
// 	);
// };

export const KnowledgeAccordion: FC = () => {
	// const { blueprint, mutate } = useBlueprint();
	const { agentId } = usePlayground();
	const { state, dispatch } = useKnowledges();
	return (
		<div className="px-4 py-2 gap-4 flex flex-col">
			<Accordion type="single" collapsible className="w-full">
				{state.knowledges.map(({ id, name, contents }) => (
					<AccordionItem value={name} key={id}>
						<AccordionTrigger handlePosition="right" className="flex gap-2">
							<BookOpenIcon className="w-4 h-4" />
							<p>{name}</p>
						</AccordionTrigger>
						<AccordionContent className="flex flex-col gap-2">
							<ul className="list-disc list-inside">
								{contents.length === 0 && (
									<div className="flex justify-center flex-col items-center py-8 px-4 bg-muted rounded gap-4">
										<div className="">
											<BookOpenIcon className="w-8 h-8" strokeWidth={1} />
										</div>
										<p className="text-center text-xs">
											No knowledge added yet. Add PDFs, documents or other
											<br />
											text to knowledge base that Claude will
											<br />
											reference in every project conversation.
										</p>
									</div>
								)}
								{contents.map(({ id, name, status }) => (
									<li
										key={id}
										className="flex items-center justify-between py-1"
									>
										<div className="flex items-center gap-2">
											<span>{name}</span>
											<Badge variant="outline">
												{upperCaseFirstLetter(status)}
											</Badge>
										</div>
										<Button variant="ghost" size="sm">
											<TrashIcon className="h-4 w-4" />
										</Button>
									</li>
								))}
							</ul>
							<div>{/**<ContentUploader knowledgeId={id} /> **/}</div>
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
					<form
						className="flex items-center gap-4"
						onSubmit={(e) => {
							e.preventDefault();
							const formData = new FormData(e.currentTarget);
							const name = formData.get("name");
							e.currentTarget.reset();
							invariant(typeof name === "string", "Name must be a string");
							dispatch(
								addKnowledge(agentId, {
									id: `knwl_${createId()}`,
									name,
									contents: [],
								}),
							);
						}}
					>
						<Input name="name" data-1p-ignore />
						<SubmitButton size="sm">Add</SubmitButton>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
