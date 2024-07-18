import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import type { FC } from "react";

type RequestButtonProps = {
	onClick: () => void;
};
export const RequestButton: FC<RequestButtonProps> = ({ onClick }) => {
	return (
		<Button
			variant={"ghost"}
			size={"xs"}
			className="text-muted-foreground"
			onClick={onClick}
		>
			<PlayIcon className="mr-1 w-3 h-3" />
			Request to Agent
		</Button>
	);
};
