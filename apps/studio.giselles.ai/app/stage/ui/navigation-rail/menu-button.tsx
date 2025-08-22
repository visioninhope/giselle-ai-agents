export function MenuButton({
	onClick,
	children,
}: Pick<
	React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	>,
	"onClick" | "children"
>) {
	return (
		<button
			type="button"
			className="group p-1.5 cursor-e-resize hover:bg-ghost-element-hover transition-colors rounded"
			onClick={onClick}
		>
			{children}
		</button>
	);
}
