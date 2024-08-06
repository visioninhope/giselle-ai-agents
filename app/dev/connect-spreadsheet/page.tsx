import type { Session } from "next-auth";
import { auth } from "./_utils/auth";
import { GoogleSessionButton } from "./google-session-button";
import { GoogleSheetsSelection } from "./google-sheets-selection";

async function fetchDrives(session: Session | null) {
	if (!session) {
		console.error("Not authenticated", { status: 401 });
		return [];
	}

	if (!(session.accessToken && typeof session.accessToken === "string")) {
		console.error("Not authenticated", { status: 401 });
		return [];
	}

	const accessToken = session.accessToken as string;

	// Google Drive API を使用してユーザーの共有ドライブを一覧を取得
	const url = "https://www.googleapis.com/drive/v3/drives";

	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!res.ok) {
		const errorDetail = await res.json();
		console.error("Error fetching team drives:", errorDetail);
		return new Response(JSON.stringify(errorDetail), {
			status: res.status,
		});
	}

	const { drives } = await res.json();
	return drives;
}

async function fetchSpreadSheets(session: Session | null, driveId: string) {
	if (!session) {
		console.error("Not authenticated", { status: 401 });
		return [];
	}

	if (!(session.accessToken && typeof session.accessToken === "string")) {
		console.error("Not authenticated", { status: 401 });
		return [];
	}

	const accessToken = session.accessToken as string;

	// Google Drive APIを使用して共有ドライブ内のファイル一覧を取得
	const res = await fetch(
		`https://www.googleapis.com/drive/v3/files?q='${driveId}'+in+parents&includeItemsFromAllDrives=true&supportsAllDrives=true`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
	);

	if (!res.ok) {
		const errorDetail = await res.json();
		console.error("Error fetching files:", errorDetail);

		return [];
	}

	const { files } = await res.json();

	const spreadsheets = files.filter(
		(file) => file.mimeType === "application/vnd.google-apps.spreadsheet",
	);

	return spreadsheets;
}

export default async function ConnectSpreadsheetPage() {
	const session = await auth();
	console.log("session", session);

	const drives = await fetchDrives(session);
	console.log("drives", drives);

	const drivesWithSpreadsheets = await Promise.all(
		drives.map(async (drive: any) => {
			const driveId = drive.id;
			const driveName = drive.name;

			const spreadsheets = await fetchSpreadSheets(session, driveId);

			return { driveId, driveName, spreadsheets };
		}),
	);

	console.log(
		"drivesWithSpreadsheets",
		JSON.stringify(drivesWithSpreadsheets, null, 2),
	);

	return (
		<>
			<div>Hello Connect Spreadsheet!</div>
			{session?.user ? (
				<>
					<div>Logged in as {session.user.name}</div>
					<div>id: {session.user.id}</div>
					<div>email: {session.user.email}</div>
					<div>image: {session.user.image}</div>
				</>
			) : (
				<div>Not logged in</div>
			)}

			<GoogleSessionButton session={session} />
			<GoogleSheetsSelection />
		</>
	);
}
