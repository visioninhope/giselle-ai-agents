// Shared table styles for consistent styling across all table components
export const tableStyles = {
	container: "w-full text-sm",
	header: {
		row: "border-b border-white-400/20",
		cell: "text-left py-3 px-4 text-white-400 font-normal text-xs",
	},
	body: {
		row: "border-b border-white-400/10",
		cell: "py-3 px-4 text-white-800 whitespace-nowrap",
	},
	status: {
		completed: "text-[#39FF7F]",
		failed: "text-[#FF3D71]",
		warning: "text-[#FFE551]",
	},
	badge: {
		success:
			"w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold",
		error:
			"w-4 h-4 rounded-full bg-[#FF3D71] text-black text-xs flex items-center justify-center font-bold",
		warning:
			"w-4 h-4 rounded-full bg-[#FFE551] text-black text-xs flex items-center justify-center font-bold",
	},
} as const;

export const panelStyles = {
	container: "px-[16px] pb-[16px] pt-[8px] h-full",
	scrollArea: "overflow-auto h-full",
} as const;
