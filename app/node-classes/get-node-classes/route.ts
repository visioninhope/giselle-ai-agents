import { NextResponse } from "next/server";
import { nodeClasses } from "../classes";

export const GET = async () => {
	return NextResponse.json({
		nodeClasses,
	});
};
