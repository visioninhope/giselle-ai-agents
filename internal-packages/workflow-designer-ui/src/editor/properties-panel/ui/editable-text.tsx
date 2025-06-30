"use client";

import clsx from "clsx/lite";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

export interface EditableTextRef {
	triggerEdit: () => void;
}

export const EditableText = forwardRef<
	EditableTextRef,
	{
		value?: string;
		fallbackValue: string;
		onChange?: (value?: string) => void;
		size?: "medium" | "large";
		ariaLabel?: string;
		className?: string;
	}
>(function EditableText(
	{ value, fallbackValue, onChange, size = "medium", ariaLabel, className },
	ref,
) {
	const [edit, setEdit] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (edit) {
			inputRef.current?.select();
			inputRef.current?.focus();
		}
	}, [edit]);

	const updateValue = useCallback(() => {
		if (!inputRef.current) {
			return;
		}
		setEdit(false);
		const currentValue =
			inputRef.current.value.length === 0 ? undefined : inputRef.current.value;
		if (fallbackValue === currentValue) {
			return;
		}
		onChange?.(currentValue);
		inputRef.current.value = currentValue ?? fallbackValue;
	}, [onChange, fallbackValue]);

	useImperativeHandle(
		ref,
		() => ({
			triggerEdit: () => setEdit(true),
		}),
		[],
	);

	return (
		<>
			<input
				type="text"
				aria-label={ariaLabel}
				className={clsx(
					"w-full min-w-[200px] py-[2px] px-[4px] rounded-[4px] hidden data-[editing=true]:block",
					"outline-none",
					"data-[size=medium]:text-[14px] data-[size=large]:text-[16px]",
					!className && "text-white-900",
					className,
				)}
				ref={inputRef}
				data-editing={edit}
				defaultValue={value ?? fallbackValue}
				onBlur={() => updateValue()}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						updateValue();
					}
				}}
				data-size={size}
			/>
			<button
				type="button"
				aria-label={ariaLabel}
				className={clsx(
					"py-[2px] px-[4px] rounded-[4px] data-[editing=true]:hidden text-left",
					"hover:bg-white-900/20 group-hover:bg-white-900/10",
					"data-[size=medium]:text-[14px] data-[size=large]:text-[16px]",
					"cursor-default w-full overflow-hidden text-ellipsis whitespace-nowrap",
					!className && "text-white-900",
					className,
				)}
				data-editing={edit}
				onClick={() => setEdit(true)}
				data-size={size}
			>
				{value ?? fallbackValue}
			</button>
		</>
	);
});
