import { XIcon } from "lucide-react";
import type { FC, PropsWithChildren } from "react";
import { useSideNav } from "../context";

type LayoutProps = {
	title: string;
};
export const Layout: FC<PropsWithChildren<LayoutProps>> = ({
	title,
	children,
}) => {
	const { dispatch } = useSideNav();
	return (
		<div className="grid gap-[24px]">
			<header className="flex justify-between">
				<p>{title}</p>
				<button
					type="button"
					onClick={() => {
						dispatch({ type: "CLOSE" });
					}}
				>
					<XIcon className="w-[16px] h-[16px]" />
				</button>
			</header>
			<main>{children}</main>
		</div>
	);
};
