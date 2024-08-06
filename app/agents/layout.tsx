import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getUser } from "@/lib/supabase";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { UserRoundIcon } from "lucide-react";
import type { ReactNode } from "react";

export default async function AgentsLayout({
	children,
}: {
	children: ReactNode;
}) {
	const user = await getUser();
	return (
		<div className="w-screen h-screen overflow-x-hidden">
			<div className="flex flex-col min-h-screen">
				<header className="flex justify-between container items-center h-10">
					<div />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="overflow-hidden rounded-full"
							>
								<UserRoundIcon className="w-6 h-6" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>{user.email}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="justify-end">
								Settings
							</DropdownMenuItem>
							<DropdownMenuItem className="justify-end">
								Support
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="justify-end">
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</header>
				<main className="flex flex-1">{children}</main>
			</div>
		</div>
	);
}
