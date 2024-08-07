import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUser } from "@/lib/supabase";
import { UserRoundIcon } from "lucide-react";
import type { FC } from "react";
import { SignOutButton } from "./sign-out-button";

export const UserButton: FC = async () => {
	const user = await getUser();
	return (
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
				<DropdownMenuItem className="justify-end">Settings</DropdownMenuItem>
				<DropdownMenuItem className="justify-end">Support</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="justify-end">
					<SignOutButton />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
