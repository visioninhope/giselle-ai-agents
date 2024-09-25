import type { FC, ReactNode } from "react";
import { TextGenerationIcon } from "../components/icons/text-generation";
import type { GiselleNodeBlueprint, GiselleNodeObject } from "./types";

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

type GiselleNodeProps = (GiselleNodeBlueprint | GiselleNodeObject) & {
	customTargetHandle?: FC<{ key: string }>;
	customSourceHandle?: FC<{ key: string }>;
};

type TargetParameterProps = {
	handle?: ReactNode;
	label: string;
};
const TargetParameter: FC<TargetParameterProps> = ({ handle, label }) => (
	<div className="relative flex items-center h-[28px]">
		<div className="*:!absolute *:!w-[6px] *:!h-[12px] *:!bg-[hsla(187,71%,48%,1)] *:!rounded-l-[12px] *:!rounded-r-none *:!top-[50%] *:!-translate-y-[50%] *:!-left-[10px]">
			{handle}
		</div>
		<div className="text-[14px] text-black--30 px-[12px]">{label}</div>
	</div>
);

type SourceParameterProps = {
	handle?: ReactNode;
	label: string;
};
const SourceParameter: FC<SourceParameterProps> = ({ handle, label }) => (
	<div className="relative flex items-center h-[28px]">
		{handle && (
			<div className="absolute -right-[10px] translate-x-[6px]">
				<div className="h-[28px] w-[10px] bg-[hsla(195,74%,21%,1)]" />
				<div className="*:!w-[12px] *:!absolute *:!h-[12px] *:!bg-black-100 *:!rounded-full *:!border-[2px] *:!border-[hsla(195,74%,21%,1)] *:!top-[50%] *:!-translate-y-[50%] *:!translate-x-[5px]">
					{handle}
				</div>
			</div>
		)}
		<div className="text-[14px] text-black--30 px-[12px]">{label}</div>
	</div>
);

export function GiselleNode(props: GiselleNodeProps) {
	return (
		<div
			className="rounded-[16px] bg-gradient-to-tl from-[hsla(187,79%,54%,0.2)] to-[hsla(207,100%,9%,0.2)] min-w-[180px] backdrop-blur-[1px]"
			// style={{ boxShadow: "0px 0px 16px 0px hsla(187, 79%, 54%, 0.5)" }}
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
						{props.archetype}
					</div>
				</div>
			</div>
			<div className="py-[4px]">
				<div className="flex justify-between h-full">
					<div className="grid">
						{props.parameters !== undefined &&
							props.parameters.object === "objectParameter" &&
							Object.entries(props.parameters.properties).map(
								([key, property]) => (
									<TargetParameter
										key={key}
										label={property.label ?? key}
										handle={props.customTargetHandle?.({ key }) ?? <div />}
									/>
								),
							)}
						{props.parameters !== undefined &&
							props.parameters.object === "objectParameterBlueprint" &&
							Object.entries(props.parameters.properties).map(
								([key, property]) => (
									<TargetParameter key={key} label={property.label ?? key} />
								),
							)}
					</div>

					<div className="grid">
						<SourceParameter
							label="Result"
							handle={
								(props.object === "node" &&
									props.customSourceHandle?.({ key: "result" })) ?? <div />
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
