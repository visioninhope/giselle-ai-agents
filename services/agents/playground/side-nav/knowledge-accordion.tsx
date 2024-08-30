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
import {
	addContentToKnowledge,
	createKnowledge,
} from "../../knowledges/actions";

import { type FC, useState } from "react";
import invariant from "tiny-invariant";

const upperCaseFirstLetter = (str: string) =>
	str.charAt(0).toUpperCase() + str.slice(1);

type ContentUploaderProps = {
	knowledgeId: number;
};
const ContentUploader: FC<ContentUploaderProps> = ({ knowledgeId }) => {
	const { mutate } = useBlueprint();
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button size="sm" variant="secondary" className="gap-2">
					<UploadIcon className="w-4 h-4" />
					<p>Add Content</p>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0 w-[200px]" align="end">
				<Command>
					<CommandList>
						<CommandGroup>
							<CommandItem>
								<form>
									<label className="flex items-center gap-2">
										<input
											type="file"
											name="file"
											className="hidden"
											onChange={(e) => {
												e.preventDefault();
												setOpen(false);
												if (e.target.files == null) {
													return;
												}
												mutate({
													type: "addContentToKnowledge",
													optimisticData: {
														knowledgeId,
														content: {
															type: "file",
															isCreating: true,
															id: createTemporaryId(),
															name: e.target.files[0].name,
															status: "in_progress",
															openaiVectorStoreFileId: "",
															file: {
																id: createTemporaryId(),
																openaiFileId: "",
															},
														},
													},
													action: () =>
														e.target.files == null
															? (() => {
																	throw new Error("File not found");
																})()
															: addContentToKnowledge({
																	knowledgeId,
																	content: {
																		name: e.target.files[0].name,
																		type: "file",
																		file: e.target.files[0],
																	},
																}),
												});
											}}
										/>
										<HardDriveUploadIcon className="w-4 h-4" />
										<p>Upload from device</p>
									</label>
								</form>
							</CommandItem>
							<CommandItem>
								<Dialog>
									<DialogTrigger asChild>
										<button type="button" className="flex items-center gap-2">
											<TextIcon className="w-4 h-4" />
											<p>Add text conent</p>
										</button>
									</DialogTrigger>
									<DialogContent>
										<form
											onSubmit={(e) => {
												e.preventDefault();
												const formData = new FormData(e.currentTarget);
												const title = formData.get("title");
												const body = formData.get("body");
												invariant(
													typeof title === "string" && title.length > 0,
													"Title is required",
												);
												invariant(
													typeof body === "string" && body.length > 0,
													"Body is required",
												);

												const content = `# ${title}\n\n${body}`;
												const blob = new Blob([content], {
													type: "text/markdown",
												});
												const file = new File([blob], `${title}.md`, {
													type: "text/markdown",
												});
												mutate({
													type: "addContentToKnowledge",
													optimisticData: {
														knowledgeId,
														content: {
															type: "text",
															isCreating: true,
															id: createTemporaryId(),
															name: title,
															status: "in_progress",
															openaiVectorStoreFileId: "",
															file: {
																openaiFileId: "",
																id: createTemporaryId(),
															},
														},
													},
													action: () =>
														addContentToKnowledge({
															knowledgeId,
															content: {
																type: "text",
																name: title,
																file,
															},
														}),
												});
											}}
										>
											<DialogHeader>
												<DialogTitle>Add text content</DialogTitle>
											</DialogHeader>
											<div className="grid gap-4 py-4">
												<div className="flex flex-col gap-4">
													<Label htmlFor="title">Title</Label>
													<Input id="title" name="title" />
												</div>
												<div className="flex flex-col gap-4">
													<Label htmlFor="content">Content</Label>
													<Textarea id="content" name="body" rows={10} />
												</div>
											</div>
											<DialogFooter>
												<Button type="submit">Add Content</Button>
											</DialogFooter>
										</form>
									</DialogContent>
								</Dialog>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export const KnowledgeAccordion: FC = () => {
	const { blueprint, mutate } = useBlueprint();
	return (
		<div className="px-4 py-2 gap-4 flex flex-col">
			<Accordion type="single" collapsible className="w-full">
				{blueprint.knowledges.map(({ id, name, contents: files }) => (
					<AccordionItem value={name} key={id}>
						<AccordionTrigger handlePosition="right" className="flex gap-2">
							<BookOpenIcon className="w-4 h-4" />
							<p>{name}</p>
						</AccordionTrigger>
						<AccordionContent className="flex flex-col gap-2">
							<ul className="list-disc list-inside">
								{files.length === 0 && (
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
								{files.map(({ id, name: fileName, status }) => (
									<li
										key={id}
										className="flex items-center justify-between py-1"
									>
										<div className="flex items-center gap-2">
											<span>{fileName}</span>
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
							<div>
								<ContentUploader knowledgeId={id} />
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
					<form
						className="flex items-center gap-4"
						onSubmit={(e) => {
							e.preventDefault();
							const formData = new FormData(e.currentTarget);
							const name = formData.get("name");
							e.currentTarget.reset();
							invariant(typeof name === "string", "Name must be a string");
							mutate({
								type: "addKnowledge",
								optimisticData: {
									blueprintId: blueprint.id,
									knowledge: {
										isCreating: true,
										id: createTemporaryId(),
										name,
										contents: [],
										openaiVectorStoreId: "",
									},
								},
								action: (optimisticData) => createKnowledge(optimisticData),
							});
						}}
					>
						<Input name="name" data-1p-ignore />
						<Button size="sm" type="submit">
							Add
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
