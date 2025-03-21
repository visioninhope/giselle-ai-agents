"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { signOut } from "../../../actions/sign-out";

export const SignOutButton = ({
	className,
	children,
}: { className?: string; children: React.ReactNode }) => {
	const router = useRouter();

	return (
		<button
			type="button"
			onClick={() => {
				signOut();
				router.push("/login");
			}}
			className={cn(
				"text-white-900 font-medium text-[12px] leading-[20.4px] font-geist cursor-pointer",
				className,
			)}
		>
			{children}
		</button>
	);
};
