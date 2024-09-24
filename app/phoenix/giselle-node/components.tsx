import type { FC } from "react";
import { TextGenerationIcon } from "../components/icons/text-generation";
import type { GiselleNodeType, Parameter } from "./types";

type GradientBorderProps = {
	rounded: string;
	from: string;
	to: string;
};
export const GradientBorder: FC<GradientBorderProps> = ({
	rounded,
	from,
	to,
}) => (
	<div
		className={`absolute z-0 ${rounded} inset-0 border mask-fill bg-gradient-to-br bg-origin-border ${from} ${to} bg-clip-boarder border-transparent`}
	/>
);

export function GiselleNode<
	TName extends string,
	TParameter extends Parameter<Record<string, Parameter>>,
>(props: GiselleNodeType<TName, TParameter>) {
	return (
		<div
			className="rounded-[16px] bg-gradient-to-tl from-[hsla(187,79%,54%,0.2)] to-[hsla(207,100%,9%,0.2)] min-w-[180px] backdrop-blur-[1px]"
			style={{ boxShadow: "0px 0px 16px 0px hsla(187, 79%, 54%, 0.5)" }}
		>
			<GradientBorder
				rounded="rounded-[16px]"
				from="from-[hsla(187,79%,54%,1)]"
				to="to-[hsla(187,68%,30%,1)]"
			/>
			<div className=" bg-[hsla(187,71%,48%,0.3)] py-[12px] rounded-t-[16px]">
				<div className="flex items-center gap-[8px] px-[12px]">
					<div
						className="bg-[hsla(187,71%,48%,1)] w-[28px] h-[28px] flex items-center justify-center rounded-[4px]"
						style={{
							boxShadow: "1px 1px 12px 0px hsla(182, 73%, 52%, 0.8)",
						}}
					>
						<TextGenerationIcon className="w-[18px] h-[18px] fill-black-100" />
					</div>
					<div className="font-rosart text-[16px] text-black-30">
						{props.name}
					</div>
				</div>
			</div>
			<div className="pb-[4px]">
				<div className="h-[28px]">
					<div className="flex justify-between h-full">
						<div className="grid">
							{props.parameters.type === "object" &&
								props.parameters.properties.map((parameter) => (
									<div className="relative flex items-center" key={key}>
										<div className="absolute w-[6px] h-[12px] bg-[hsla(187,71%,48%,1)] rounded-l-[12px] top-[50%] -translate-y-[50%] -left-[14px]" />
										<div className="text-[14px] text-black--30 px-[12px]">
											Instuction
										</div>
									</div>
								))}
						</div>

						<div className="grid">
							<div className="relative flex items-center">
								<div className="text-[14px] text-black--30 px-[12px]">
									Result
								</div>
								<div className="absolute -right-[10px] translate-x-[6px]">
									<div className="h-[28px] w-[10px] bg-[hsla(195,74%,21%,1)]" />
									<div className="absolute w-[12px] h-[12px] bg-black-100 rounded-full border-[2px] border-[hsla(195,74%,21%,1)] top-[50%] -translate-y-[50%] translate-x-[5px]" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
