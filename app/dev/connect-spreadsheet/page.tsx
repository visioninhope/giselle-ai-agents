import { GoogleSessionButton } from "./GoogleSessionButton";
import { auth } from "./_utils/auth";
import { GoogleSheetsSelection } from "./google-sheets-selection";

export default async function ConnectSpreadsheetPage() {
	const session = await auth();

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
