import { ClickableText } from "@/components/ui/clickable-text";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { ActionPrompt } from "../components/action-prompt";
import { Form } from "./form";

export default function ResetPasswordPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<h2
						className="mt-6 text-[28px] font-[500] text-primary-100 font-sans text-center"
						style={{ textShadow: "0px 0px 20px #0087F6" }}
					>
						Reset your password
					</h2>
					<Form />
					<div className="flex justify-center">
						<ActionPrompt
							leftIcon={
								<ChevronLeftIcon className="w-[16px] h-[16px] text-black-70" />
							}
							action={
								<ClickableText asChild>
									<Link href="/login">Back to log in</Link>
								</ClickableText>
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
