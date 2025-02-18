import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	if (process.env.VERCEL_ENV === "production") {
		return new NextResponse(null, { status: 404 });
	}
	return NextResponse.next();
}
