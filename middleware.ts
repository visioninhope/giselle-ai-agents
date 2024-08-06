import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
export { auth as middleware } from "@/app/dev/connect-spreadsheet/_utils/auth"; // https://authjs.dev/getting-started/installation?framework=next.js#configure

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, request) => {
	if (!isPublicRoute(request)) {
		auth().protect();
	}
});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
