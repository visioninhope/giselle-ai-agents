import { createClient, getUser } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserInitializationTask } from "../lib";
import { AutoReloader } from "./auto-reloader";

export default async function InitializingAccountPage() {
	const user = await getUser();
	const task = await getUserInitializationTask({ supabaseUserId: user.id });

	if (task.status === "COMPLETED") {
		redirect("/agents");
	}

	return (
		<div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
			<div className="space-y-4 text-center">
				<p className="text-muted-foreground">Initializing your account...</p>
			</div>
			<AutoReloader />
		</div>
	);
}
