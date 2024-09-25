import { clsx } from "clsx/lite";
import type { FC, ReactNode } from "react";
import { TextGenerationIcon } from "../components/icons/text-generation";
import {
	type GiselleNodeBlueprint,
	type GiselleNodeCategory,
	type GiselleNodeObject,
	giselleNodeCategories,
} from "./types";

type GiselleNodeProps = (GiselleNodeBlueprint | GiselleNodeObject) & {
	customTargetHandle?: FC<{ key: string }>;
	customSourceHandle?: FC<{ key: string }>;
};

type TargetParameterProps = {
	handle?: ReactNode;
	label: string;
	category: GiselleNodeCategory;
};
const TargetParameter: FC<TargetParameterProps> = ({
	handle,
	label,
	category,
}) => (
	<div className="relative flex items-center h-[28px]">
		<div
			className={clsx(
				"*:!absolute *:!w-[6px] *:!h-[12px] *:!rounded-l-[12px] *:!rounded-r-none *:!top-[50%] *:!-translate-y-[50%] *:!-left-[10px]",
				category === giselleNodeCategories.action &&
					"*:!bg-[hsla(187,71%,48%,1)]",
				category === giselleNodeCategories.instruction &&
					"*:!bg-[hsla(236,7%,39%,1)]",
			)}
		>
			{handle}
		</div>
		<div className="text-[14px] text-black--30 px-[12px]">{label}</div>
	</div>
);

type SourceParameterProps = {
	handle?: ReactNode;
	label: string;
	category: GiselleNodeCategory;
};
const SourceParameter: FC<SourceParameterProps> = ({
	handle,
	label,
	category,
}) => (
	<div className="relative flex items-center h-[28px]">
		{handle && (
			<div className="absolute -right-[10px] translate-x-[6px]">
				<div
					className={clsx(
						"h-[28px] w-[10px]",
						category === giselleNodeCategories.action &&
							"bg-[hsla(195,74%,21%,1)]",
						category === giselleNodeCategories.instruction &&
							"bg-[hsla(236,7%,39%,1)]",
					)}
				/>
				<div
					className={clsx(
						"*:!w-[12px] *:!absolute *:!h-[12px] *:!bg-black-100 *:!rounded-full *:!border-[2px] *:!top-[50%] *:!-translate-y-[50%] *:!translate-x-[5px]",
						category === giselleNodeCategories.action &&
							"*:!border-[hsla(195,74%,21%,1)]",
						category === giselleNodeCategories.instruction &&
							"*:!border-[hsla(236,7%,39%,1)]",
					)}
				>
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
			className={clsx(
				"rounded-[16px] bg-gradient-to-tl min-w-[180px] backdrop-blur-[1px]",
				props.category === giselleNodeCategories.action &&
					"from-[hsla(187,79%,54%,0.2)] to-[hsla(207,100%,9%,0.2)]",
				props.category === giselleNodeCategories.instruction &&
					"from-[hsla(0,0%,91%,0.2)] to-[hsla(0,0%,16%,0.2)]",
			)}
			// style={{ boxShadow: "0px 0px 16px 0px hsla(187, 79%, 54%, 0.5)" }}
		>
			<div
				className={clsx(
					"absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent",
					props.category === giselleNodeCategories.action &&
						"from-[hsla(187,79%,54%,1)] to-[hsla(187,68%,30%,1)]",
					props.category === giselleNodeCategories.instruction &&
						"from-[hsla(0,0%,91%,1)] to-[hsla(0,0%,35%,1)]",
				)}
			/>
			<div
				className={clsx(
					"py-[12px] rounded-t-[16px]",
					props.category === giselleNodeCategories.action &&
						"bg-[hsla(187,71%,48%,0.3)]",
					props.category === giselleNodeCategories.instruction &&
						"bg-[hsla(0,0%,93%,0.3)]",
				)}
			>
				<div className="flex items-center gap-[8px] px-[12px]">
					<div
						className={clsx(
							"w-[28px] h-[28px] flex items-center justify-center rounded-[4px] shadow-[1px_1px_12px_0px]",
							props.category === giselleNodeCategories.action &&
								"bg-[hsla(187,71%,48%,1)] shadow-[hsla(182,73%,52%,0.8)]",
							props.category === giselleNodeCategories.instruction &&
								"bg-white shadow-[hsla(0,0%,93%,0.8)]",
						)}
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
										category={props.category}
									/>
								),
							)}
						{props.parameters !== undefined &&
							props.parameters.object === "objectParameterBlueprint" &&
							Object.entries(props.parameters.properties).map(
								([key, property]) => (
									<TargetParameter
										key={key}
										label={property.label ?? key}
										category={props.category}
									/>
								),
							)}
					</div>

					<div className="grid">
						<SourceParameter
							label={props.resultPortLabel}
							category={props.category}
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
