import clsx from "clsx/lite";
import { useState } from "react";
import { PanelCloseIcon } from "../../beta-proto/components/icons/panel-close";
import { useGraphSelection } from "../contexts/graph-selection";

export function PropertiesPanel() {
	const { selectedNodes } = useGraphSelection();
	const [show, setShow] = useState(false);
	return (
		<div
			className={clsx(
				"absolute bg-black-100 rounded-[16px] overflow-hidden shadow-[0px_0px_8px_0px_hsla(0,_0%,_100%,_0.2)] top-[0px] right-[20px] mt-[60px] p-[16px]",
				"data-[state=show]:w-[380px] data-[state=show]:bottom-[20px]",
			)}
			data-state={show ? "show" : "hidden"}
		>
			<div className="absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent from-[hsla(233,4%,37%,1)] to-[hsla(233,62%,22%,1)]" />

			{show ? (
				<div className="relative z-10 flex justify-between h-[24px] items-center">
					<button type="button" onClick={() => setShow(false)}>
						<PanelCloseIcon className="w-[18px] h-[18px] fill-black-30" />
					</button>
				</div>
			) : (
				<div className="relative z-10 flex justify-between items-center">
					<button type="button" onClick={() => setShow(true)}>
						<PanelCloseIcon className="w-[18px] h-[18px] fill-black-30" />
					</button>
				</div>
			)}
		</div>
	);
}
