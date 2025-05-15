import { XIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

// 外部からタグを管理できるようにする基本的なタグ入力コンポーネント
export type BasicTagInputProps = {
	initialTags?: string[];
	onTagsChange?: (tags: string[]) => void;
	label?: string;
	placeholder?: string;
	validateInput?: (input: string) => { isValid: boolean; message?: string };
	emptyStateText?: string;
};

export function BasicTagInput({
	initialTags = [],
	onTagsChange,
	label = "Tags",
	placeholder = "Type and press Enter",
	validateInput,
	emptyStateText = "No tags added yet",
}: BasicTagInputProps) {
	// タグを管理するためのローカル状態
	const [tags, setTags] = useState<string[]>(initialTags);
	const [inputValue, setInputValue] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);

	// 入力フィールド用のID生成
	const inputId = `tag-input-${label.toLowerCase().replace(/\s+/g, "-")}`;

	// initialTagsが変更された場合にローカル状態を更新
	useEffect(() => {
		setTags(initialTags);
	}, [initialTags]);

	// タグ追加処理
	const addTag = () => {
		if (inputValue.trim() !== "") {
			// バリデーションチェック
			if (validateInput) {
				const validationResult = validateInput(inputValue.trim());
				if (!validationResult.isValid) {
					setValidationError(validationResult.message || "Invalid input");
					return;
				}
			}

			const newTags = [...tags, inputValue.trim()];
			setTags(newTags);
			setInputValue("");
			setValidationError(null);

			// 親コンポーネントに変更を通知
			if (onTagsChange) {
				onTagsChange(newTags);
			}
		}
	};

	// 入力値の変更時にバリデーションエラーをクリア
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		if (validationError) {
			setValidationError(null);
		}
	};

	// タグ削除処理
	const removeTag = (index: number) => {
		const newTags = tags.filter((_, i) => i !== index);
		setTags(newTags);

		// 親コンポーネントに変更を通知
		if (onTagsChange) {
			onTagsChange(newTags);
		}
	};

	// 共通のGeistフォントスタイル
	const geistFontStyle = {
		fontFamily: "var(--font-geist), system-ui, sans-serif",
	};

	return (
		<div className="w-full mb-5 flex" style={geistFontStyle}>
			{/* 左側：ラベル */}
			<div className="w-1/4">
				<label
					htmlFor={inputId}
					className="block text-sm font-medium"
					style={geistFontStyle}
				>
					{label}
				</label>
			</div>

			{/* 右側：タグと入力フィールド */}
			<div className="w-3/4 flex flex-col">
				{/* タグを表示するエリア */}
				<div className="flex flex-wrap gap-1 mb-3">
					{tags.map((tag, index) => (
						<div
							key={`${tag}-${index}`}
							style={{
								display: "flex",
								alignItems: "center",
								backgroundColor: "var(--white-850, #F5F5F5)",
								padding: "2px 6px",
								borderRadius: "4px",
								border: "none",
								color: "var(--black-850, #0D1424)",
								marginRight: "4px",
								marginBottom: "4px",
								fontFamily: "var(--font-geist), system-ui, sans-serif",
							}}
						>
							<span className="mr-1 text-sm">{tag}</span>
							<button
								type="button"
								onClick={() => removeTag(index)}
								style={{
									padding: "0 0 0 2px",
									color: "var(--black-400, #505D7B)",
									backgroundColor: "transparent",
									border: "none",
									cursor: "pointer",
									fontFamily: "var(--font-geist), system-ui, sans-serif",
								}}
							>
								<XIcon className="h-3 w-3" />
							</button>
						</div>
					))}
					{tags.length === 0 && (
						<span
							className="text-gray-500 italic text-sm"
							style={geistFontStyle}
						>
							{emptyStateText}
						</span>
					)}
				</div>

				{/* 入力エリア */}
				<div
					style={{
						display: "flex",
						padding: "6px 12px",
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						flex: "1 0 0",
						alignSelf: "stretch",
						borderRadius: "8px",
						border: validationError
							? "0.5px solid var(--color-error-900, #FF627E)"
							: "0.5px solid var(--white-900, #F7F9FD)",
					}}
				>
					<input
						id={inputId}
						type="text"
						value={inputValue}
						onChange={handleInputChange}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addTag();
							}
						}}
						placeholder={placeholder}
						style={{
							color:
								inputValue || isFocused
									? "var(--white-900, #F7F9FD)"
									: "var(--black-400, #505D7B)",
							fontFamily: "var(--font-geist), system-ui, sans-serif",
							fontSize: "14px",
							fontStyle: "normal",
							fontWeight: 500,
							lineHeight: "170%",
							width: "100%",
							flex: 1,
							backgroundColor: "transparent",
							border: "none",
							outline: "none",
							padding: 0,
						}}
					/>
					<button
						type="button"
						onClick={addTag}
						disabled={inputValue.trim() === ""}
						style={{
							marginLeft: "8px",
							padding: "4px 12px",
							backgroundColor: "#F7F9FD",
							color: "#1E293B",
							borderRadius: "4px",
							border: "none",
							fontSize: "14px",
							fontWeight: 500,
							fontFamily: "var(--font-hubot-sans), system-ui, sans-serif",
							cursor: inputValue.trim() === "" ? "not-allowed" : "pointer",
							opacity: inputValue.trim() === "" ? 0.5 : 1,
						}}
					>
						Add
					</button>
				</div>

				{/* バリデーションエラーメッセージ */}
				{validationError && (
					<div
						style={{
							color: "var(--color-error-900, #FF627E)",
							fontSize: "12px",
							marginTop: "4px",
							fontFamily: "var(--font-geist), system-ui, sans-serif",
						}}
					>
						{validationError}
					</div>
				)}
			</div>
		</div>
	);
}

// テスト用コンポーネント
export function BasicTagInputTest() {
	const [testTags, setTestTags] = useState<string[]>(["example", "test"]);

	const handleTagsChange = (newTags: string[]) => {
		console.log("Tags changed:", newTags);
		setTestTags(newTags);
	};

	return (
		<div
			className="p-4 bg-gray-900 rounded-lg"
			style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
		>
			<BasicTagInput
				initialTags={testTags}
				onTagsChange={handleTagsChange}
				label="Test Tags"
				placeholder="Add a test tag"
			/>

			<div className="mt-4 text-gray-400 text-sm">
				External tags state: {testTags.join(", ") || "none"}
			</div>
		</div>
	);
}
