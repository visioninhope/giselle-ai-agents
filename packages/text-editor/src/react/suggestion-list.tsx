import type { Node as GiselleNode, Output } from "@giselle-sdk/data-type";
import { defaultName } from "@giselle-sdk/giselle/react";
import type { SuggestionProps } from "@tiptap/suggestion";
import clsx from "clsx/lite";
import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useState,
} from "react";

export interface SuggestionItem {
	id: string;
	node: GiselleNode;
	output: Output;
	label: string;
}
export interface SuggestionListProps extends SuggestionProps<SuggestionItem> {}
export interface SuggestionListRef {
	onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SuggestionList = forwardRef<
	SuggestionListRef,
	SuggestionListProps
>((props, ref) => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	const filteredItems = useMemo(() => {
		return props.items;
	}, [props.items]);

	const selectItem = useCallback(
		(index: number) => {
			const item = filteredItems[index];
			if (item) {
				props.command(item);
			}
		},
		[filteredItems, props.command],
	);

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }) => {
			if (event.key === "ArrowUp") {
				setSelectedIndex(
					(prev) => (prev + filteredItems.length - 1) % filteredItems.length,
				);
				return true;
			}
			if (event.key === "ArrowDown") {
				setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
				return true;
			}

			if (event.key === "Enter") {
				selectItem(selectedIndex);
				return true;
			}

			return false;
		},
	}));

	if (filteredItems.length === 0) {
		return null;
	}

	return (
		<div
			className={clsx(
				"rounded-[8px] bg-(image:--glass-bg)",
				"p-[4px] border border-glass-border/20 backdrop-blur-md shadow-xl",
				"after:absolute after:bg-(image:--glass-highlight-bg) after:left-4 after:right-4 after:h-px after:top-0",
				"min-w-[200px]",
			)}
		>
			{filteredItems.map((item, index) => (
				<button
					type="button"
					key={item.id}
					onClick={() => selectItem(index)}
					className={clsx(
						"block w-full text-left px-[8px] py-[6px]",
						"text-[14px] text-text",
						"rounded-[4px]",
						"outline-none cursor-pointer",
						"transition-colors",
						selectedIndex === index
							? "bg-ghost-element-hover"
							: "hover:bg-ghost-element-hover/25",
					)}
				>
					{item.node.name ?? defaultName(item.node)} / {item.output.label}
				</button>
			))}
		</div>
	);
});

SuggestionList.displayName = "SuggestionList";
