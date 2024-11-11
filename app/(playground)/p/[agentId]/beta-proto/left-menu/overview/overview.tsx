import { XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface OverviewProps {
	setTabValue: (value: string) => void;
}
export function Overview(props: OverviewProps) {
	const [editTitle, setEditTitle] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const transitionToEditTitle = useCallback(() => {
		setEditTitle(true);
	}, []);
	useEffect(() => {
		if (editTitle && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [editTitle]);
	return (
		<div className="grid gap-[24px] px-[24px] py-[24px]">
			<header className="flex justify-between">
				<p
					className="text-[22px] font-rosart text-black--30"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					Overview
				</p>
				<button type="button">
					<XIcon
						className="w-[16px] h-[16px]"
						onClick={() => props.setTabValue("")}
					/>
				</button>
			</header>
			{editTitle ? (
				<input
					type="text"
					className="text-[16px] text-black-30 p-[4px] text-left outline-black-70 rounded-[8px]"
					onBlur={() => setEditTitle(false)}
					ref={inputRef}
					defaultValue={"Unnamed Agent"}
				/>
			) : (
				<button
					type="button"
					onClick={() => transitionToEditTitle()}
					className="text-[16px] text-black-30 p-[4px] text-left"
				>
					Unnamed Agent
				</button>
			)}
		</div>
	);
}
