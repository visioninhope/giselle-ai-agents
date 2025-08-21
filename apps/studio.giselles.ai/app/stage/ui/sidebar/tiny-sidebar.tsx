import { Button } from "@giselle-internal/ui/button";
import { GiselleIcon } from "@giselle-internal/workflow-designer-ui";
import clsx from "clsx/lite";
import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { links, tinySidebarWidthClassName } from "./variable";

export function TinySidebar({
	show,
	onOpenButtonClick,
}: {
	show: boolean;
	onOpenButtonClick: () => void;
}) {
	const pathname = usePathname();
	return (
		<div
			className={clsx(
				"hidden md:block fixed top-0 left-0 h-full flex-col border-r border-white/10 transition-all duration-300 py-4",
				tinySidebarWidthClassName,
				show ? "z-10" : "border-none",
			)}
		>
			<div className="mb-4 relative flex">
				<button
					type="button"
					onClick={onOpenButtonClick}
					className="cursor-pointer"
				>
					<GiselleIcon className="text-white-900 w-[24px] h-[24px]" />
				</button>
				{/*<button
						type="button"
						onClick={toggleOpen}
						className="absolute text-white-700 hover:text-white-900 transition-colors outline-none cursor-pointer right-1"
					>
						<ChevronLeftIcon
							className={clsx(
								"w-4 h-4 transition-transform duration-300",
								!open && "rotate-180",
							)}
						/>
					</button>*/}
			</div>
			<nav className="flex flex-col gap-4">
				<Button variant="glass" size="large" asChild className="w-full">
					<Link href="/stage">
						<SparklesIcon className="size-[18px]" />
					</Link>
				</Button>
				{links.map((link) => (
					<div className="relative group" key={link.href}>
						<Link
							href={link.href}
							className={clsx(
								"w-full flex flex-row items-center justify-start gap-1 pl-2",
								link.isActive(pathname)
									? "text-white-900"
									: "text-text-nav-inactive hover:text-text-nav-active",
							)}
						>
							{link.icon && <link.icon className="size-[18px] flex-shrink-0" />}
						</Link>
					</div>
				))}
			</nav>
		</div>
	);
}
