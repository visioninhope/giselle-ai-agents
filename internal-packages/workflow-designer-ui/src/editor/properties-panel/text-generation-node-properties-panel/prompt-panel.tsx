import type { Node } from "@giselle-sdk/data-type";
import { TextEditor } from "@giselle-sdk/text-editor/react";
import { BracesIcon } from "lucide-react";
import { Toolbar as ToolbarPrimitive } from "radix-ui";
import { DropdownMenuTrigger } from "../../../ui/dropdown-menu";
import { NodeDropdown } from "../ui";

export function PromptPanel({
	prompt,
	onPromptChange,
	sourceNodes = [],
}: {
	prompt?: string;
	onPromptChange?: (prompt: string) => void;
	sourceNodes?: Node[];
}) {
	return (
		<TextEditor
			value={prompt}
			onValueChange={(value) => {
				onPromptChange?.(value);
			}}
			tools={(editor) => (
				<NodeDropdown
					nodes={sourceNodes}
					trigerNode={
						<ToolbarPrimitive.Button
							value="bulletList"
							aria-label="Bulleted list"
							data-toolbar-item
							asChild
						>
							<DropdownMenuTrigger>
								<BracesIcon className="w-[18px]" />
							</DropdownMenuTrigger>
						</ToolbarPrimitive.Button>
					}
					onValueChange={(node) => {
						editor
							.chain()
							.focus()
							.insertContentAt(
								editor.state.selection.$anchor.pos,
								`{{${node.id}}}`,
							)
							.run();
					}}
				/>
			)}
		/>
	);
}
