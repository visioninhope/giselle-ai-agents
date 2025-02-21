import clsx from "clsx/lite";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

export function PropertiesPanelRoot({
	children,
}: {
	children: ReactNode;
}) {
	return <div className="h-full flex flex-col gap-[8px]">{children}</div>;
}

export function PropertiesPanelHeader({
	name,
	fallbackName: propsFallbackName,
	description,
	icon,
	onChangeName,
	action,
}: {
	name?: string;
	fallbackName?: string;
	description?: string;
	icon: ReactNode;
	onChangeName?: (name?: string) => void;
	action?: ReactNode;
}) {
	const [edit, setEdit] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (edit) {
			inputRef.current?.select();
			inputRef.current?.focus();
		}
	}, [edit]);
	const fallbackName = useMemo(
		() => propsFallbackName ?? "Unnamed Node",
		[propsFallbackName],
	);
	const updateName = useCallback(() => {
		if (!inputRef.current) {
			return;
		}
		setEdit(false);
		const currentValue =
			inputRef.current.value.length === 0 ? undefined : inputRef.current.value;
		if (fallbackName === currentValue) {
			return;
		}
		onChangeName?.(currentValue);
		inputRef.current.value = currentValue ?? fallbackName;
	}, [onChangeName, fallbackName]);
	return (
		<div className="h-[48px] flex justify-between items-center px-[16px] shrink-0">
			<div className="flex gap-[8px] items-center">
				<div className="w-[28px] h-[28px] bg-white-900 rounded-[4px] flex items-center justify-center">
					{icon}
				</div>
				<div className="group" data-editing={edit}>
					<input
						type="text"
						className={clsx(
							"w-[200px] py-[2px] px-[4px] rounded-[8px] hidden group-data-[editing=true]:block",
							"outline-none ring-[1px] ring-primary-900",
							"text-white-900 text-[14px]",
						)}
						ref={inputRef}
						data-edit={edit}
						defaultValue={name ?? fallbackName}
						onBlur={updateName}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								updateName();
							}
						}}
					/>
					<button
						type="button"
						className={clsx(
							"py-[2px] px-[4px] rounded-[8px] group-data-[editing=true]:hidden",
							"hover:bg-white-900/20",
							"text-white-900 text-[14px]",
							"cursor-default",
						)}
						onClick={() => setEdit(true)}
					>
						{name ?? fallbackName}
					</button>
					{description && (
						<p className="px-[5px] text-white-400 text-[10px]">{description}</p>
					)}
				</div>
			</div>
			{action}
		</div>
	);
}

export function PropertiesPanelContent({
	children,
}: {
	children: ReactNode;
}) {
	return <div className="px-[16px] h-full">{children}</div>;
}
