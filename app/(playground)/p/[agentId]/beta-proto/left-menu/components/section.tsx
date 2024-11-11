interface HeadingProps {
	title: string;
}
export function Heading(props: HeadingProps) {
	return (
		<div className="flex items-center">
			<span className="flex-shrink text-black-30 text-[16px] font-rosart font-[500]">
				{props.title}
			</span>
			<div className="ml-[16px] flex-grow border-t border-black-80" />
		</div>
	);
}
