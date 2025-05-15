import { XIcon } from "lucide-react";
import React, { type KeyboardEvent, useRef, useState } from "react";

export type Tag = {
	id: string;
	label: string;
};

type TagInputFieldProps = {
	tags: Tag[];
	onAddTag: (value: string) => void;
	onRemoveTag: (id: string) => void;
	placeholder?: string;
	className?: string;
	label?: string;
	inputId?: string;
};

export function TagInputField({
	tags,
	onAddTag,
	onRemoveTag,
	placeholder = "タグを入力...",
	className = "",
	label,
	inputId,
}: TagInputFieldProps) {
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim() !== "") {
			e.preventDefault();
			onAddTag(inputValue.trim());
			setInputValue("");
		}
	};

	const handleRemoveTag = (id: string) => {
		onRemoveTag(id);
	};

	const focusInput = () => {
		inputRef.current?.focus();
	};

	return (
		<div className={`relative w-full ${className}`}>
			{label && (
				<label
					htmlFor={inputId}
					className="block text-sm font-medium mb-1 text-gray-700"
				>
					{label}
				</label>
			)}
			<button
				type="button"
				onClick={focusInput}
				className="flex flex-wrap items-center w-full px-3 py-2 border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 min-h-[38px] text-left"
			>
				{tags.map((tag) => (
					<div
						key={tag.id}
						className="flex items-center bg-white border border-gray-200 rounded-sm mr-2 mb-1"
					>
						<span className="px-2 py-1 text-sm">{tag.label}</span>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handleRemoveTag(tag.id);
							}}
							className="flex items-center justify-center h-full px-1 text-gray-500 hover:text-gray-700"
						>
							<XIcon className="h-4 w-4" />
						</button>
					</div>
				))}
				<input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={tags.length === 0 ? placeholder : ""}
					className="flex-1 min-w-[80px] h-6 outline-none border-none bg-transparent text-sm"
				/>
			</button>
		</div>
	);
}

// 使用例
export function TagInputFieldExample() {
	const [tags, setTags] = useState<Tag[]>([
		{ id: "1", label: "ブランド Maison Margiela(メゾン マルジェラ)" },
	]);

	const handleAddTag = (value: string) => {
		const newTag: Tag = {
			id: Date.now().toString(),
			label: value,
		};
		setTags([...tags, newTag]);
	};

	const handleRemoveTag = (id: string) => {
		setTags(tags.filter((tag) => tag.id !== id));
	};

	return (
		<div className="p-4">
			<TagInputField
				tags={tags}
				onAddTag={handleAddTag}
				onRemoveTag={handleRemoveTag}
				placeholder="入力してEnterで追加"
				label="ブランド"
			/>
		</div>
	);
}
