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
		<div className="px-4 pb-4 pt-2 h-full">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Time</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Steps</TableHead>
						<TableHead>Trigger</TableHead>
						<TableHead>
							Duration
							<br />
							<span className="whitespace-nowrap">(Wall-Clock)</span>
						</TableHead>
						<TableHead>
							Duration
							<br />
							<span className="whitespace-nowrap">(Total tasks)</span>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell className="whitespace-nowrap">
							2025/01/15 14:30
						</TableCell>
						<TableCell className="whitespace-nowrap">
							<span className="text-[#39FF7F]">completed</span>
						</TableCell>
						<TableCell className="whitespace-nowrap">
							<span className="inline-flex items-center gap-1">
								<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
									✓
								</span>
								<span className="text-xs">2</span>
							</span>
						</TableCell>
						<TableCell className="whitespace-nowrap">manual</TableCell>
						<TableCell className="whitespace-nowrap">2.1s</TableCell>
						<TableCell className="whitespace-nowrap">2.5s</TableCell>
					</TableRow>
					<TableRow>
						<TableCell className="whitespace-nowrap">
							2025/01/15 14:25
						</TableCell>
						<TableCell className="whitespace-nowrap">
							<span className="text-[#FF3D71]">failed</span>
						</TableCell>
						<TableCell className="whitespace-nowrap">
							<span className="inline-flex items-center gap-1">
								<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
									✓
								</span>
								<span className="text-xs">1</span>
								<span className="w-4 h-4 rounded-full bg-[#FF3D71] text-black text-xs flex items-center justify-center font-bold">
									✕
								</span>
								<span className="text-xs">1</span>
							</span>
						</TableCell>
						<TableCell className="whitespace-nowrap">manual</TableCell>
						<TableCell className="whitespace-nowrap">1.8s</TableCell>
						<TableCell className="whitespace-nowrap">2.2s</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
}
