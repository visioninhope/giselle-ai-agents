import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "lucide-react";
import { useCallback, useState } from "react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "../../../components/dialog";
import {
	addSourceToPromptNode,
	updateNodeProperty,
} from "../../../graph/actions";
import { useGraph } from "../../../graph/context";
import { createTextContentId } from "../../../text-content/factory";
import type { GiselleNode } from "../../types";

type AddSourceDialogProps = {
	node: GiselleNode;
};
export function AddSourceDialog(props: AddSourceDialogProps) {
	const { dispatch } = useGraph();
	const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
		(e) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const title = formData.get("title") as string;
			const content = formData.get("content") as string;
			dispatch(
				addSourceToPromptNode({
					promptNode: {
						id: props.node.id,
					},
					source: {
						object: "textContent",
						id: createTextContentId(),
						title,
						content,
					},
				}),
			);
			setOpen(false);
		},
		[dispatch, props.node.id],
	);
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<PaperclipIcon size={18} className="stroke-black-30" />
			</DialogTrigger>
			<DialogContent className="h-auto w-[500px]">
				<div className="flex flex-col h-full overflow-hidden z-10">
					<DialogTitle className="sr-only">
						Are you absolutely sure?
					</DialogTitle>
					<DialogDescription className="sr-only">
						This action cannot be undone. This will permanently delete your
						account and remove your data from our servers.
					</DialogDescription>
					<form
						className="p-[40px] font-rosart text-[14px] text-black-30 drop-shadow-[0px_0px_20px_0px_hsla(207,_100%,_48%,_1)] gap-[24px] flex flex-col"
						onSubmit={handleSubmit}
					>
						<div className="border-b border-black-70 pb-[4px]">
							Add text content
						</div>
						<div className="flex flex-col gap-[4px]">
							<input
								type="text"
								className="bg-[hsla(0,0%,100%,0.29)] rounded-[4px] p-[12px] text-white placeholder:text-[hsla(207,43%,91%,0.6)] focus:outline focus:outline-[1px] focus:outline-black--50 font-avenir text-[12px]"
								placeholder="Title"
								name="title"
								data-1p-ignore
							/>
							<textarea
								placeholder="Content"
								name="content"
								rows={8}
								className="bg-[hsla(0,0%,100%,0.29)] rounded-[4px] p-[12px] text-white placeholder:text-[hsla(207,43%,91%,0.6)] focus:outline focus:outline-[1px] focus:outline-black--50 font-avenir text-[12px] resize-none"
							/>
						</div>
						<div className="flex items-center gap-[18px]">
							<DialogClose asChild>
								<Button type="button" variant="link" className="justify-center">
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit" className="font-[400]">
								Complete
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
