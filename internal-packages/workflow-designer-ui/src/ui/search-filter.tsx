import React, { useEffect, useState } from "react";
import { type Tag, TagInput } from "./tag-input";

export type SearchFilterProps = {
	onFilterChange?: (include: Tag[], exclude: Tag[]) => void;
	className?: string;
	includePlaceholder?: string;
	excludePlaceholder?: string;
};

export function SearchFilter({
	onFilterChange,
	className = "",
	includePlaceholder = "ドメインを入力（例：example.com）",
	excludePlaceholder = "除外するドメインを入力",
}: SearchFilterProps) {
	const [includeTags, setIncludeTags] = useState<Tag[]>([]);
	const [excludeTags, setExcludeTags] = useState<Tag[]>([]);

	// 親コンポーネントに変更を通知
	useEffect(() => {
		onFilterChange?.(includeTags, excludeTags);
	}, [includeTags, excludeTags, onFilterChange]);

	// includeタグの追加
	const handleAddIncludeTag = (value: string) => {
		const newTag: Tag = {
			id: Date.now().toString(),
			label: value,
		};
		setIncludeTags([...includeTags, newTag]);
	};

	// includeタグの削除
	const handleRemoveIncludeTag = (id: string) => {
		setIncludeTags(includeTags.filter((tag) => tag.id !== id));
	};

	// excludeタグの追加
	const handleAddExcludeTag = (value: string) => {
		const newTag: Tag = {
			id: Date.now().toString(),
			label: value,
		};
		setExcludeTags([...excludeTags, newTag]);
	};

	// excludeタグの削除
	const handleRemoveExcludeTag = (id: string) => {
		setExcludeTags(excludeTags.filter((tag) => tag.id !== id));
	};

	return (
		<div className={`flex flex-col gap-4 ${className}`}>
			{/* Include フィルター */}
			<TagInput
				label="検索ドメイン (include)"
				tags={includeTags}
				onAddTag={handleAddIncludeTag}
				onRemoveTag={handleRemoveIncludeTag}
				placeholder={includePlaceholder}
				buttonLabel="追加"
			/>

			{/* Exclude フィルター */}
			<TagInput
				label="除外ドメイン (exclude)"
				tags={excludeTags}
				onAddTag={handleAddExcludeTag}
				onRemoveTag={handleRemoveExcludeTag}
				placeholder={excludePlaceholder}
				buttonLabel="追加"
			/>
		</div>
	);
}

// 使用例
export function SearchFilterExample() {
	const handleFilterChange = (include: Tag[], exclude: Tag[]) => {
		console.log("Include:", include);
		console.log("Exclude:", exclude);
	};

	return (
		<div className="p-4 border rounded">
			<SearchFilter onFilterChange={handleFilterChange} />
		</div>
	);
}
