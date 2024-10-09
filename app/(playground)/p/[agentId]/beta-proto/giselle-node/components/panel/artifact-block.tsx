import { DocumentIcon } from "../../../components/icons/document";
import { SpinnerIcon } from "../../../components/icons/spinner";
import type { GiselleNode } from "../../types";
import { Block } from "./block";

type ArtifactBlockProps = {
	title: string;
	node: Pick<GiselleNode, "archetype" | "name">;
	loading?: boolean;
};
export function ArtifactBlock(props: ArtifactBlockProps) {
	return (
		<Block
			title={props.title}
			icon={
				props.loading ? (
					<SpinnerIcon className="w-[18px] h-[18px] stroke-black-30 animate-follow-through-spin fill-transparent" />
				) : (
					<DocumentIcon className="w-[18px] h-[18px] fill-black-30" />
				)
			}
			description={`${props.node.archetype} / ${props.node.name}`}
		/>
	);
}
