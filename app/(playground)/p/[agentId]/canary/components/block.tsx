import type { ReactNode } from "react";

export function Block({ children, ...props }: { children: ReactNode }) {
	return (
		<div
			className="px-[12px] py-[8px] rounded-[4px] relative bg-[hsla(202,52%,46%,0.1)] text-left group"
			{...props}
		>
			<div className="z-10 relative">{children}</div>
			<div className="absolute z-0 rounded-[4px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent to-[hsla(233,4%,37%,1)] from-[hsla(233,62%,22%,1)]" />
		</div>
	);
}
