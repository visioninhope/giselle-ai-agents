import type { Session } from "next-auth";
import { auth } from "./_utils/auth";
import { signIn, signOut } from "./_utils/auth";
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
		return [];
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
		(file: any) => file.mimeType === "application/vnd.google-apps.spreadsheet",
	);

	return spreadsheets;
}

async function fetchSheets(session: Session | null, sheetId: string) {
	if (!session) {
		console.error("Not authenticated", { status: 401 });
		return [];
	}

	if (!(session.accessToken && typeof session.accessToken === "string")) {
		console.error("Not authenticated", { status: 401 });
		return [];
	}

	const accessToken = session.accessToken as string;

	// Google Sheets APIを使用してスプレッドシートのシート一覧を取得
	// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/get
	const res = await fetch(
		`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
	);

	if (!res.ok) {
		const errorDetail = await res.json();
		console.error("Error fetching sheets:", errorDetail);
		return [];
	}

	const { sheets } = await res.json();

	return sheets;
}

export default async function ConnectSpreadsheetPage() {
	const session = await auth();
	// console.log("session", session);

	const drives = await fetchDrives(session);
	// console.log("drives", drives);

	const drivesWithSpreadsheets = await Promise.all(
		drives.map(async (drive: any) => {
			const driveId = drive.id;
			const driveName = drive.name;

			const spreadsheets = await fetchSpreadSheets(session, driveId);

			return { driveId, driveName, spreadsheets };
		}),
	);

	// console.log(
	// 	"drivesWithSpreadsheets",
	// 	JSON.stringify(drivesWithSpreadsheets, null, 2),
	// );

	// drivesWithSpreadsheets に spreadsheets が含まれているので、これをループして、さらに sheets 一覧を取得する
	const data = await Promise.all(
		drivesWithSpreadsheets.map(async (driveWithSpreadsheets) => {
			const { driveId, driveName, spreadsheets } = driveWithSpreadsheets;

			const spreadsheetsWithSheets = await Promise.all(
				spreadsheets.map(async (spreadsheet: any) => {
					const sheetId = spreadsheet.id;
					const sheetName = spreadsheet.name;

					const sheets = await fetchSheets(session, sheetId);

					return { sheetId, sheetName, sheets };
				}),
			);

			return { driveId, driveName, spreadsheets: spreadsheetsWithSheets };
		}),
	);

	// console.log("data", JSON.stringify(data, null, 2));

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

			<form
				action={async () => {
					"use server";
					await signOut();
				}}
			>
				<button type="submit">Sign out</button>
			</form>

			<form
				action={async () => {
					"use server";
					await signIn("google");
				}}
			>
				<button type="submit">Connect to Google Spreadsheet</button>
			</form>
			<GoogleSheetsSelection data={data} />
		</>
	);
}
