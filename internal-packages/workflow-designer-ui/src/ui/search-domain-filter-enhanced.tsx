import React, { useEffect, useState } from "react";
import { type DomainTag, DomainTagInput } from "./domain-tag-input";

export type SearchDomainFilterEnhancedProps = {
	onFilterChange?: (include: string[], exclude: string[]) => void;
	className?: string;
	includePlaceholder?: string;
	excludePlaceholder?: string;
	defaultIncludeDomains?: string[];
	defaultExcludeDomains?: string[];
};

export function SearchDomainFilterEnhanced({
	onFilterChange,
	className = "",
	includePlaceholder = "Enter text to include",
	excludePlaceholder = "Enter text to exclude",
	defaultIncludeDomains = [],
	defaultExcludeDomains = [],
}: SearchDomainFilterEnhancedProps) {
	console.log("[SearchDomainFilterEnhanced] Component rendering");
	console.log(
		"[SearchDomainFilterEnhanced] defaultIncludeDomains:",
		defaultIncludeDomains,
	);
	console.log(
		"[SearchDomainFilterEnhanced] defaultExcludeDomains:",
		defaultExcludeDomains,
	);

	// Create initial tags with unique IDs
	const createInitialTags = (domains: string[]): DomainTag[] => {
		return domains.map((domain, index) => ({
			id: `initial-${index}-${domain}-${Date.now()}`,
			domain: domain,
		}));
	};

	// Initialize state with default values
	const [includeDomains, setIncludeDomains] = useState<DomainTag[]>(() => {
		const initialTags = createInitialTags(defaultIncludeDomains);
		console.log(
			"[SearchDomainFilterEnhanced] Initial include domains:",
			initialTags,
		);
		return initialTags;
	});

	const [excludeDomains, setExcludeDomains] = useState<DomainTag[]>(() => {
		const initialTags = createInitialTags(defaultExcludeDomains);
		console.log(
			"[SearchDomainFilterEnhanced] Initial exclude domains:",
			initialTags,
		);
		return initialTags;
	});

	// Effect to notify parent of changes
	useEffect(() => {
		if (onFilterChange) {
			const includeValues = includeDomains.map((tag) => tag.domain);
			const excludeValues = excludeDomains.map((tag) => tag.domain);
			console.log(
				"[SearchDomainFilterEnhanced] Notifying parent of filter change:",
				{ includeValues, excludeValues },
			);
			onFilterChange(includeValues, excludeValues);
		}
	}, [includeDomains, excludeDomains, onFilterChange]);

	// Debug current state when it changes
	useEffect(() => {
		console.log(
			"[SearchDomainFilterEnhanced] Current include domains:",
			includeDomains,
		);
	}, [includeDomains]);

	useEffect(() => {
		console.log(
			"[SearchDomainFilterEnhanced] Current exclude domains:",
			excludeDomains,
		);
	}, [excludeDomains]);

	// Add include domain
	const handleAddIncludeDomain = (domain: string) => {
		console.log("[SearchDomainFilterEnhanced] Adding include domain:", domain);

		// Check for duplicates
		if (includeDomains.some((d) => d.domain === domain)) {
			console.log(
				"[SearchDomainFilterEnhanced] Duplicate in include list, not adding",
			);
			return;
		}
		// Check if exists in exclude list
		if (excludeDomains.some((d) => d.domain === domain)) {
			console.log(
				"[SearchDomainFilterEnhanced] Already in exclude list, not adding",
			);
			return;
		}

		const newDomain: DomainTag = {
			id: `include-${Date.now()}`,
			domain,
		};

		setIncludeDomains((prevDomains) => {
			const newDomains = [...prevDomains, newDomain];
			console.log(
				"[SearchDomainFilterEnhanced] New include domains:",
				newDomains,
			);
			return newDomains;
		});
	};

	// Remove include domain
	const handleRemoveIncludeDomain = (id: string) => {
		console.log(
			"[SearchDomainFilterEnhanced] Removing include domain with id:",
			id,
		);
		setIncludeDomains((prevDomains) => {
			return prevDomains.filter((d) => d.id !== id);
		});
	};

	// Add exclude domain
	const handleAddExcludeDomain = (domain: string) => {
		console.log("[SearchDomainFilterEnhanced] Adding exclude domain:", domain);

		// Check for duplicates
		if (excludeDomains.some((d) => d.domain === domain)) {
			console.log(
				"[SearchDomainFilterEnhanced] Duplicate in exclude list, not adding",
			);
			return;
		}
		// Check if exists in include list
		if (includeDomains.some((d) => d.domain === domain)) {
			console.log(
				"[SearchDomainFilterEnhanced] Already in include list, not adding",
			);
			return;
		}

		const newDomain: DomainTag = {
			id: `exclude-${Date.now()}`,
			domain,
		};

		setExcludeDomains((prevDomains) => {
			const newDomains = [...prevDomains, newDomain];
			console.log(
				"[SearchDomainFilterEnhanced] New exclude domains:",
				newDomains,
			);
			return newDomains;
		});
	};

	// Remove exclude domain
	const handleRemoveExcludeDomain = (id: string) => {
		console.log(
			"[SearchDomainFilterEnhanced] Removing exclude domain with id:",
			id,
		);
		setExcludeDomains((prevDomains) => {
			return prevDomains.filter((d) => d.id !== id);
		});
	};

	return (
		<div className={`search-domain-filter mt-8 ${className}`}>
			<div className="mb-4 text-[15px] font-medium text-white">
				Search Domain Filter
			</div>

			{/* Debug info */}
			{process.env.NODE_ENV === "development" && (
				<div className="mb-4 p-2 bg-gray-800 text-xs text-gray-400 rounded">
					<div>Include count: {includeDomains.length}</div>
					<div>Exclude count: {excludeDomains.length}</div>
				</div>
			)}

			{/* Include domain input and tags */}
			<DomainTagInput
				domains={includeDomains}
				onAddDomain={handleAddIncludeDomain}
				onRemoveDomain={handleRemoveIncludeDomain}
				placeholder={includePlaceholder}
				label="Allow List"
			/>

			{/* Exclude domain input and tags */}
			<DomainTagInput
				domains={excludeDomains}
				onAddDomain={handleAddExcludeDomain}
				onRemoveDomain={handleRemoveExcludeDomain}
				placeholder={excludePlaceholder}
				label="Deny List"
			/>
		</div>
	);
}

// Test component to verify functionality
export function SearchDomainFilterEnhancedTest() {
	console.log("[SearchDomainFilterEnhancedTest] Component rendering");
	const [includeTerms, setIncludeTerms] = useState<string[]>([]);
	const [excludeTerms, setExcludeTerms] = useState<string[]>([]);

	const handleFilterChange = (include: string[], exclude: string[]) => {
		console.log("[SearchDomainFilterEnhancedTest] Filter changed:", {
			include,
			exclude,
		});
		setIncludeTerms(include);
		setExcludeTerms(exclude);
	};

	return (
		<div className="p-4 bg-gray-900 rounded">
			<h2 className="text-white text-lg mb-4">Search Filter Test</h2>

			<SearchDomainFilterEnhanced
				onFilterChange={handleFilterChange}
				defaultIncludeDomains={["example.com", "Brand Maison Margiela"]}
				defaultExcludeDomains={["exclude.com"]}
			/>

			<div className="mt-4 p-2 bg-gray-800 rounded">
				<h3 className="text-white text-sm mb-2">
					Current filter (debug view):
				</h3>
				<div className="text-gray-300 text-xs">
					<div>Include: {includeTerms.join(", ") || "(none)"}</div>
					<div>Exclude: {excludeTerms.join(", ") || "(none)"}</div>
				</div>
			</div>
		</div>
	);
}
