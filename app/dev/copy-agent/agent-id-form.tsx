"use client";

export default function AgentIdForm() {
	return (
	<div className="text-black--30">
	<span>> </span>
		<input
			type="text"
			className="outline-0"
			ref={(ref) => {
				ref?.focus();
			}}
		/>
	</div>
	);
}
