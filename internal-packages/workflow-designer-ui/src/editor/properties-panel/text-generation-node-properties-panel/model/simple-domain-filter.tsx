import { useEffect, useState } from "react";
import { BasicTagInput } from "../../../../ui/basic-tag-input";

// 有効なドメイン名かどうかをチェックする関数
const isValidDomain = (domain: string): boolean => {
	// 簡易的なドメイン名のバリデーション
	// 基本的なドメイン名パターン: example.com, sub.example.co.jp など
	const domainRegex =
		/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
	return domainRegex.test(domain);
};

export function SimpleDomainFilter({
	searchDomainFilter,
	onSearchDomainFilterChange,
}: {
	searchDomainFilter: string[];
	onSearchDomainFilterChange: (newFilter: string[]) => void;
}) {
	// ローカル状態の作成
	const [allowList, setAllowList] = useState<string[]>([]);
	const [denyList, setDenyList] = useState<string[]>([]);
	// 内部更新フラグを追加
	const [isInternalUpdate, setIsInternalUpdate] = useState(false);

	// 初期データの設定
	useEffect(() => {
		// 内部更新の場合はスキップ
		if (isInternalUpdate) {
			setIsInternalUpdate(false);
			return;
		}

		const allow = searchDomainFilter.filter((d) => !d.startsWith("-"));
		const deny = searchDomainFilter
			.filter((d) => d.startsWith("-"))
			.map((d) => d.slice(1));

		setAllowList(allow);
		setDenyList(deny);
	}, [searchDomainFilter, isInternalUpdate]);

	// Allow リストの変更処理
	const handleAllowListChange = (newTags: string[]) => {
		setAllowList(newTags);
		updateParent(newTags, denyList);
	};

	// Deny リストの変更処理
	const handleDenyListChange = (newTags: string[]) => {
		setDenyList(newTags);
		updateParent(allowList, newTags);
	};

	// 親コンポーネントに通知する関数
	const updateParent = (allow: string[], deny: string[]) => {
		const formattedDeny = deny.map((d) => `-${d}`);
		const combined = [...allow, ...formattedDeny];

		// 内部更新フラグをセット
		setIsInternalUpdate(true);
		onSearchDomainFilterChange(combined);
	};

	// ドメイン名のバリデーション関数
	const validateDomainName = (input: string) => {
		if (!isValidDomain(input)) {
			return {
				isValid: false,
				message: `'${input}' は有効なドメイン名ではありません (例: example.com)`,
			};
		}
		return { isValid: true };
	};

	return (
		<div>
			<h2
				style={{
					color: "white",
					marginBottom: "12px",
				}}
			>
				Search Domain Filter
			</h2>

			<div className="space-y-4">
				{/* Allow リスト */}
				<BasicTagInput
					initialTags={allowList}
					onTagsChange={handleAllowListChange}
					label="Allow List"
					placeholder="Enter domain to include (e.g., example.com)"
					validateInput={validateDomainName}
					emptyStateText="No domains added yet"
				/>

				{/* Deny リスト */}
				<BasicTagInput
					initialTags={denyList}
					onTagsChange={handleDenyListChange}
					label="Deny List"
					placeholder="Enter domain to exclude"
					validateInput={validateDomainName}
					emptyStateText="No domains added yet"
				/>
			</div>
		</div>
	);
}
