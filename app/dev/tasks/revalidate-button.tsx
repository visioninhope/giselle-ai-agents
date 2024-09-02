import { revalidatePath, revalidateTag } from "next/cache";
import type { FC } from "react";

export const RevalidateButton: FC = () => {
	async function revalidateCache() {
		"use server";
		// revalidatePath("/dev/tasks");
		revalidateTag("tasks");
	}
	return (
		<form action={revalidateCache}>
			<button type="submit">Update</button>
		</form>
	);
};
