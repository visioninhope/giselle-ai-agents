import * as v from "valibot";
import { getCookie, setCookie } from "./signed-cookie";

const COOKIE_NAME = "giselle-session";

const GiselleSessionSchema = v.object({
	teamDbId: v.nullable(v.number()),
});

type GiselleSession = v.InferOutput<typeof GiselleSessionSchema>;

export async function getGiselleSession(): Promise<GiselleSession | null> {
	const rawSession = await getCookie(COOKIE_NAME);
	if (rawSession == null) {
		return null;
	}
	return v.parse(GiselleSessionSchema, rawSession);
}

export async function updateGiselleSession(session: GiselleSession) {
	const currentSession = await getGiselleSession();
	await setGiselleSession({ ...currentSession, ...session });
}

async function setGiselleSession(session: GiselleSession) {
	await setCookie(COOKIE_NAME, session);
}
