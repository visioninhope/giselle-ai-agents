import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import {
	BookOpenIcon,
	HardDriveUploadIcon,
	LoaderCircle,
	TextIcon,
	TrashIcon,
	UploadIcon,
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
import type { KnowledgeContent, KnowledgeId } from "../../../knowledges";
import { useAddContentState } from "./add-content-state-provider";
import { AddFileToKnowledgeContentForm } from "./add-file-to-knowledge-content-form";

const AddedTrigger: FC = () => {
	const { dispatch } = useAddContentState();
	useEffect(() => {
		console.log("show");
		dispatch({ type: "ADDED" });
	}, [dispatch]);
	return null;
};

type KnowledgeContentListProps = {
	knowledgeId: KnowledgeId;
	knowledgeContents: KnowledgeContent[];
};
export const KnowledgeContentList: React.FC<KnowledgeContentListProps> = ({
	knowledgeId,
	knowledgeContents,
}) => {
	return (
		<div>
			<ul className="list-disc list-inside">
				{knowledgeContents.length === 0 && (
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
				{knowledgeContents.map(({ id, name, status }) => (
					<li key={id} className="flex items-center justify-between py-1">
						<div className="flex items-center gap-2">
							<span>{name}</span>
							<Badge variant="outline">{status}</Badge>
						</div>
						<Button variant="ghost" size="sm">
							<TrashIcon className="h-4 w-4" />
						</Button>
						<AddedTrigger />
					</li>
				))}
			</ul>
			<div>
				<ContentUploader knowledgeId={knowledgeId} />
			</div>
		</div>
	);
};

type ContentUploaderProps = {
	knowledgeId: KnowledgeId;
};
const ContentUploader: FC<ContentUploaderProps> = ({ knowledgeId }) => {
	const [open, setOpen] = useState(false);
	const { isAdding, dispatch } = useAddContentState();
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					size="sm"
					variant="secondary"
					className="gap-2"
					disabled={isAdding}
				>
					{isAdding ? (
						<LoaderCircle className="w-4 h-4 animate-spin" />
					) : (
						<UploadIcon className="w-4 h-4" />
					)}
					<p>Add Content</p>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0 w-[200px]" align="end">
				<Command>
					<CommandList>
						<CommandGroup>
							<CommandItem>
								<AddFileToKnowledgeContentForm
									knowledgeId={knowledgeId}
									onSubmit={() => {
										setOpen(false);
										dispatch({ type: "ADDING" });
									}}
								/>
							</CommandItem>
							{/**<CommandItem>
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
								</CommandItem> **/}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
