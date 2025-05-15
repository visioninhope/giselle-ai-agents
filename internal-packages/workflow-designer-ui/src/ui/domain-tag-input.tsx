import { XIcon } from "lucide-react";
import React, { type KeyboardEvent, useEffect, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

export type DomainTag = {
	id: string;
	domain: string;
};

type DomainTagInputProps = {
	domains: DomainTag[];
	onAddDomain: (domain: string) => void;
	onRemoveDomain: (id: string) => void;
	placeholder?: string;
	className?: string;
	label?: string;
};

export function DomainTagInput({
	domains,
	onAddDomain,
	onRemoveDomain,
	placeholder = "Enter text to add",
	className = "",
	label,
}: DomainTagInputProps) {
	const [inputValue, setInputValue] = useState("");

	const handleAddDomain = () => {
		const value = inputValue.trim();
		if (!value) return;

		onAddDomain(value);
		setInputValue("");
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddDomain();
		}
	};

	return (
		<div className="w-full mb-6">
			{/* Label */}
			<div className="flex mb-2">
				<div className="w-[150px]">
					<span className="text-[14px] text-white pl-2">{label}</span>
				</div>
			</div>

			{/* タグエリア - 入力フィールドの上 */}
			<div className="flex flex-wrap ml-[150px] mb-4">
				{domains.map((domain) => (
					<div
						key={domain.id}
						className="flex items-center bg-gray-800 text-white rounded-sm px-2 py-1 mr-2 mb-2"
					>
						<span className="mr-1 text-sm">{domain.domain}</span>
						<button
							type="button"
							onClick={() => onRemoveDomain(domain.id)}
							className="text-gray-300 hover:text-white"
						>
							<XIcon className="h-3 w-3" />
						</button>
					</div>
				))}
			</div>

			{/* 入力エリア - タグの下に配置 */}
			<div className="flex items-center">
				<div className="w-[150px]">{/* ラベルとの整列のためのスペース */}</div>
				<div className="flex-1 flex items-center">
					<Input
						className="w-full h-10 bg-transparent border-[0.5px] border-white-900 rounded-md text-[14px] text-gray-300 px-3 py-2 placeholder:text-gray-500"
						placeholder={placeholder}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						maxLength={100}
					/>
					<Button
						className="ml-2 px-2 py-1 text-sm text-gray-300 opacity-50 hover:opacity-100"
						variant="ghost"
						onClick={handleAddDomain}
						disabled={!inputValue.trim()}
					>
						Add
					</Button>
				</div>
			</div>
		</div>
	);
}

// Test component with direct rendering
export function DomainTagInputTest() {
	const [domains, setDomains] = useState<DomainTag[]>([
		{ id: "1", domain: "example.com" },
		{ id: "2", domain: "Brand Maison Margiela" },
	]);

	const handleAddDomain = (domain: string) => {
		// 重複チェック
		if (domains.some((d) => d.domain === domain)) {
			return;
		}

		const newDomain: DomainTag = {
			id: Date.now().toString(),
			domain,
		};

		setDomains([...domains, newDomain]);
	};

	const handleRemoveDomain = (id: string) => {
		setDomains(domains.filter((d) => d.id !== id));
	};

	// This will independently verify if the component works
	return (
		<div className="p-4 bg-gray-900 rounded">
			<h2 className="text-white text-lg mb-4">DomainTagInput Test</h2>
			<DomainTagInput
				domains={domains}
				onAddDomain={handleAddDomain}
				onRemoveDomain={handleRemoveDomain}
				placeholder="Enter text to add"
				label="Test Tags"
			/>

			<div className="mt-4 p-2 bg-gray-800 rounded">
				<h3 className="text-white text-sm mb-2">
					Current domains (debug view):
				</h3>
				<pre className="text-gray-300 text-xs">
					{JSON.stringify(domains, null, 2)}
				</pre>
			</div>
		</div>
	);
}
