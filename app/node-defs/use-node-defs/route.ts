import { NextResponse } from "next/server";
import { nodeDefs } from "../";

export const GET = async () => {
	return NextResponse.json({
		nodeDefs,
	});
};
