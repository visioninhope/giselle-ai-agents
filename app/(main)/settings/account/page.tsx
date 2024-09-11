import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { LinkText } from "@/components/ui/link-text";
import { getUser } from "@/lib/supabase";
import Link from "next/link";
import { Card } from "../components/card";

export default async function AccountSettingPage() {
	const user = await getUser();
	return (
		<div className="grid gap-[16px]">
			<h3
				className="text-[32px] text-black--30 font-[Rosart]"
				style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
			>
				Account
			</h3>
			<Card title="Account Information">
				<div className="max-w-[600px] mb-[4px]">
					<Field
						label="Email"
						name="email"
						type="email"
						value={user.email}
						disabled
					/>
				</div>
			</Card>
			<Card title="Reset Password">
				<div className="w-[220px]">
					<Link href="/password_reset/new_password">
						<Button>Reset Password</Button>
					</Link>
				</div>
			</Card>
			<Card title="Delete Account">
				<div className="w-[220px]">
					<Link href="#">
						<LinkText>Contact Support</LinkText>
					</Link>
				</div>
			</Card>
		</div>
	);
}
