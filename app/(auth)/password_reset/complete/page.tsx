import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageTitle } from "../../components/page-title";

export default function CompleteResetPasswordPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<PageTitle>Reset Password</PageTitle>
					<Button asChild>
						<Link href="/agents">Continue</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
