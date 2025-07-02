import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@giselle-internal/ui/table";

export default function () {
	return (
		<>
			<h2 className="text-text mb-6">Table</h2>
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Demo</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell>John Doe</TableCell>
										<TableCell>john@example.com</TableCell>
										<TableCell>Admin</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>Jane Doe</TableCell>
										<TableCell>jane@example.com</TableCell>
										<TableCell>User</TableCell>
									</TableRow>
								</TableBody>
								<TableFooter>
									<TableRow>
										<TableCell colSpan={3}>Total: 2</TableCell>
									</TableRow>
								</TableFooter>
								<TableCaption>Demo table</TableCaption>
							</Table>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
