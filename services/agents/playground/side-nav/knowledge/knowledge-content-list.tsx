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
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	BookOpenIcon,
	LoaderCircle,
	TrashIcon,
	UploadIcon,
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
import {
	type KnowledgeContent,
	type KnowledgeId,
	removeKnowledgeContent,
} from "../../../knowledges";
import { AddFileToKnowledgeContentForm } from "./add-file-to-knowledge-content-form";
import { AddTextToKnowledgeContentForm } from "./add-text-to-knowledge-content-form";
import { useContentState } from "./content-state-provider";

const Trigger: FC = () => {
	const { dispatch } = useContentState();
	useEffect(() => {
		console.log("show");
		dispatch({ type: "ADDED" });
		return () => {
			dispatch({ type: "REMOVED" });
		};
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
	const { dispatch, isRemoving } = useContentState();
	return (
		<div className="flex flex-col gap-4">
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

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="ghost" size="sm">
									<TrashIcon className="h-4 w-4" />
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px]">
								<DialogHeader>
									<DialogTitle>Confirm deletion of content</DialogTitle>
									<DialogDescription>
										Are you sure you would like to delete the content{" "}
										<span className="font-bold">{name}</span>({id})?
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<DialogClose asChild>
										<Button
											type="button"
											variant="secondary"
											disabled={isRemoving}
										>
											Cancel
										</Button>
									</DialogClose>
									<Button
										type="submit"
										variant="destructive"
										disabled={isRemoving}
										onClick={async () => {
											dispatch({ type: "REMOVING" });
											await removeKnowledgeContent(id);
										}}
									>
										Delete file
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
						<Trigger />
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
	const { isAdding, dispatch } = useContentState();
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

							<CommandItem>
								<AddTextToKnowledgeContentForm
									knowledgeId={knowledgeId}
									onSubmit={() => {
										setOpen(false);
										dispatch({ type: "ADDING" });
									}}
								/>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
