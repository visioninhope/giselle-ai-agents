import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@giselle-internal/ui/table";

export function RunHistoryTable() {
	return (
		<div className="h-full bg-surface-background p-[16px]">
			<div className="flex justify-between items-center">
				<h1 className="font-accent text-text text-[18px] mb-[8px]">
					Run history
				</h1>
			</div>
			<Table className="table-auto">
				<TableHeader>
					<TableRow>
						<TableHead className="w-[180px]">Time</TableHead>
						<TableHead className="w-[100px]">Status</TableHead>
						<TableHead className="w-[100px]">Trigger</TableHead>
						<TableHead className="w-[100px]">Duration</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>2025-06-16 21:22</TableCell>
						<TableCell>Success</TableCell>
						<TableCell>Manual</TableCell>
						<TableCell>22s</TableCell>
						<TableCell />
					</TableRow>
					<TableRow>
						<TableCell>2025-06-16 21:22</TableCell>
						<TableCell>Success</TableCell>
						<TableCell>Manual</TableCell>
						<TableCell>22s</TableCell>
						<TableCell />
					</TableRow>
					<TableRow>
						<TableCell>2025-06-16 21:22</TableCell>
						<TableCell>Success</TableCell>
						<TableCell>Manual</TableCell>
						<TableCell>22s</TableCell>
						<TableCell />
					</TableRow>
					<TableRow>
						<TableCell>2025-06-16 21:22</TableCell>
						<TableCell>Success</TableCell>
						<TableCell>Manual</TableCell>
						<TableCell>22s</TableCell>
						<TableCell />
					</TableRow>
					<TableRow>
						<TableCell>2025-06-16 21:22</TableCell>
						<TableCell>Success</TableCell>
						<TableCell>Manual</TableCell>
						<TableCell>22s</TableCell>
						<TableCell />
					</TableRow>
					<TableRow>
						<TableCell>2025-06-16 21:22</TableCell>
						<TableCell>Success</TableCell>
						<TableCell>Manual</TableCell>
						<TableCell>22s</TableCell>
						<TableCell />
					</TableRow>
					<TableRow>
						<TableCell>2025-06-16 21:22</TableCell>
						<TableCell>Success</TableCell>
						<TableCell>Manual</TableCell>
						<TableCell>22s</TableCell>
						<TableCell />
					</TableRow>
					<TableRow>
						<TableCell>2025-06-16 21:22</TableCell>
						<TableCell>Success</TableCell>
						<TableCell>Manual</TableCell>
						<TableCell>22s</TableCell>
						<TableCell />
					</TableRow>
					<TableRow>
						<TableCell>2025-06-16 21:22</TableCell>
						<TableCell>Success</TableCell>
						<TableCell>Manual</TableCell>
						<TableCell>22s</TableCell>
						<TableCell />
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
}
