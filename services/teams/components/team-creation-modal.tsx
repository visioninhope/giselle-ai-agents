import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { createTeam } from "../actions/create-team";
import { TeamCreationForm } from "./team-creation-form";

interface TeamCreationModalProps {
	hasExistingFreeTeam: boolean;
}

export default function TeamCreationModal({
	hasExistingFreeTeam,
}: TeamCreationModalProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Link
					href="#"
					className="flex items-center text-sm text-blue-500 hover:text-blue-400"
				>
					+ Create New Team
				</Link>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] bg-gray-950 text-gray-100">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-gray-100">
						Create New Team
					</DialogTitle>
				</DialogHeader>
				<TeamCreationForm
					hasExistingFreeTeam={hasExistingFreeTeam}
					createTeam={createTeam}
				/>
			</DialogContent>
		</Dialog>
	);
}
