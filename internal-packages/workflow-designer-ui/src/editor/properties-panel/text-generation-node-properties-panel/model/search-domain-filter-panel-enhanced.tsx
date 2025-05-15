import { useEffect, useMemo } from "react";
import { SearchDomainFilterEnhanced } from "../../../../ui/search-domain-filter-enhanced";

export function SearchDomainFilterPanelEnhanced({
	searchDomainFilter,
	onSearchDomainFilterChange,
}: {
	searchDomainFilter: string[];
	onSearchDomainFilterChange: (newFilter: string[]) => void;
}) {
	// Log the incoming data
	useEffect(() => {
		console.log(
			"[SearchDomainFilterPanelEnhanced] searchDomainFilter:",
			searchDomainFilter,
		);
	}, [searchDomainFilter]);

	// 既存のフィルター配列から、includeとexcludeのドメインに分割
	const allowlist = useMemo(
		() => searchDomainFilter.filter((d) => !d.startsWith("-")),
		[searchDomainFilter],
	);

	const denylist = useMemo(
		() =>
			searchDomainFilter
				.filter((d) => d.startsWith("-"))
				.map((d) => d.slice(1)),
		[searchDomainFilter],
	);

	// Log the processed lists
	useEffect(() => {
		console.log(
			"[SearchDomainFilterPanelEnhanced] Processed allowlist:",
			allowlist,
		);
		console.log(
			"[SearchDomainFilterPanelEnhanced] Processed denylist:",
			denylist,
		);
	}, [allowlist, denylist]);

	// フィルター変更時のハンドラー
	const handleFilterChange = (include: string[], exclude: string[]) => {
		// Log the incoming data
		console.log(
			"[SearchDomainFilterPanelEnhanced] handleFilterChange called with:",
			{ include, exclude },
		);

		// exclude項目には"-"を付与して、既存の形式に合わせる
		const formattedExclude = exclude.map((domain) => `-${domain}`);
		// includeとexcludeを結合して、既存の形式に合わせる
		const merged = [...include, ...formattedExclude];

		console.log(
			"[SearchDomainFilterPanelEnhanced] Sending merged filter:",
			merged,
		);
		onSearchDomainFilterChange(merged);
	};

	return (
		<div className="search-domain-filter-panel-enhanced">
			{/* Debug info */}
			{process.env.NODE_ENV === "development" && (
				<div className="mb-4 p-2 bg-gray-800 text-xs text-gray-400 rounded">
					<div>Original filter count: {searchDomainFilter.length}</div>
					<div>Allow list count: {allowlist.length}</div>
					<div>Deny list count: {denylist.length}</div>
				</div>
			)}

			<SearchDomainFilterEnhanced
				onFilterChange={handleFilterChange}
				defaultIncludeDomains={allowlist}
				defaultExcludeDomains={denylist}
				includePlaceholder="Enter domain to include (e.g., example.com)"
				excludePlaceholder="Enter domain to exclude"
			/>
		</div>
	);
}
