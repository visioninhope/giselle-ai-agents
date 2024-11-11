import { XIcon } from "lucide-react";

interface GitHubIntegrationProps {
	setTabValue: (value: string) => void;
}
export function GitHubIntegration(props: GitHubIntegrationProps) {
	return (
		<div className="grid gap-[24px] px-[24px] py-[24px]">
			<header className="flex justify-between">
				<p
					className="text-[22px] font-rosart text-black--30"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					GitHub Integration
				</p>
				<button type="button">
					<XIcon
						className="w-[16px] h-[16px]"
						onClick={() => props.setTabValue("")}
					/>
				</button>
			</header>
		</div>
	);
}
