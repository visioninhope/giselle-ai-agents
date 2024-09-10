import { PageTitle } from "../components/page-title";
import { Form } from "./form";

export default function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<PageTitle>Reset your password</PageTitle>
					<Form />
				</div>
			</div>
		</div>
	);
}
