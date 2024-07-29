import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// export default clerkMiddleware((auth, request) => {
// 	if (!isPublicRoute(request)) {
// 		auth().protect();
// 	}
// });

export async function middleware(request: NextRequest) {
	return await updateSession(request);
}
export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
