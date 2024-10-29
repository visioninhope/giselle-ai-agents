import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

const getURL = () => {
	let url =
		process?.env?.NEXT_PUBLIC_SITE_URL ??
		process?.env?.NEXT_PUBLIC_VERCEL_URL ??
		"http://localhost:3000/";
	url = url.startsWith("http") ? url : `https://${url}`;
	url = url.endsWith("/") ? url : `${url}/`;
	return url;
};

export async function GET(_request: Request) {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "github",
		options: {
			redirectTo: `${getURL()}auth/callback`,
		},
	});

	if (error != null) {
		const { code, message, name, status } = error;
		throw new Error(`${name} occurred: ${code} (${status}): ${message}`);
	}
	if (data.url) {
		redirect(data.url);
	}
}
