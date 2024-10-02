import { DocumentIcon } from "../../../components/icons/document";
import { SpinnerIcon } from "../../../components/icons/spinner";
import type { GiselleNode } from "../../types";

type ArtifactBlockProps = {
	title: string;
	node: Pick<GiselleNode, "archetype" | "name">;
	loading?: boolean;
};
export function ArtifactBlock(props: ArtifactBlockProps) {
	return (
		<button
			type="button"
			className="px-[16px] py-[8px] rounded-[4px] relative bg-[hsla(202,52%,46%,0.1)] text-left inline-flex items-center gap-[16px]"
		>
			{props.loading ? (
				<SpinnerIcon className="w-[18px] h-[18px] stroke-black-30 animate-follow-through-spin fill-transparent" />
			) : (
				<DocumentIcon className="w-[18px] h-[18px] fill-black-30" />
			)}
			<div>
				<p className="line-clamp-1 text-[14px] font-rosart">{props.title}</p>
				<p className="line-clamp-1 font-rosart text-black-70 text-[8px]">
					{props.node.archetype} / {props.node.name}
				</p>
			</div>
			<div className="absolute z-0 rounded-[4px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent to-[hsla(233,4%,37%,1)] from-[hsla(233,62%,22%,1)]" />
		</button>
	);
}
