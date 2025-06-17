import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@giselle-internal/ui/table";
import clsx from "clsx/lite";
import {
	CircleAlertIcon,
	CircleCheckIcon,
	CircleDotIcon,
	CircleXIcon,
} from "lucide-react";

const dummyData = [
	{
		id: 1,
		time: "2025-06-16 21:22",
		status: "success",
		steps: {
			success: 2,
		},
		trigger: "GitHub",
		duration: "22s",
	},
	{
		id: 2,
		time: "2025-06-16 21:20",
		status: "success",
		steps: {
			success: 3,
		},
		trigger: "Manual",
		duration: "18s",
	},
	{
		id: 3,
		time: "2025-06-16 21:18",
		status: "error",
		steps: {
			success: 1,
			error: 1,
		},
		trigger: "GitHub",
		duration: "5s",
	},
	{
		id: 4,
		time: "2025-06-16 21:15",
		status: "success",
		steps: {
			success: 4,
			warning: 1,
		},
		trigger: "Manual",
		duration: "31s",
	},
	{
		id: 5,
		time: "2025-06-16 21:10",
		status: "inProgress",
		steps: {
			success: 2,
			inProgress: 1,
		},
		trigger: "GitHub",
		duration: "45s",
	},
	{
		id: 6,
		time: "2025-06-16 21:05",
		status: "success",
		steps: {
			success: 3,
		},
		trigger: "Scheduled",
		duration: "28s",
	},
	{
		id: 7,
		time: "2025-06-16 21:00",
		status: "success",
		steps: {
			success: 2,
		},
		trigger: "GitHub",
		duration: "22s",
	},
	{
		id: 8,
		time: "2025-06-16 20:55",
		status: "error",
		steps: {
			error: 1,
		},
		trigger: "Scheduled",
		duration: "3s",
	},
	{
		id: 9,
		time: "2025-06-16 20:50",
		status: "success",
		steps: {
			success: 3,
		},
		trigger: "GitHub",
		duration: "26s",
	},
];

export function RunHistoryTable() {
	return (
		<div className="h-full bg-surface-background p-[16px]">
			<div className="flex justify-between items-center">
				<h1 className="font-accent text-text text-[18px] mb-[8px]">
					Run history
				</h1>
			</div>
			<Table className="table-auto font-mono">
				<TableHeader>
					<TableRow>
						<TableHead className="w-[180px]">Time</TableHead>
						<TableHead className="w-[100px]">Status</TableHead>
						<TableHead className="w-[100px]">Steps</TableHead>
						<TableHead className="w-[100px]">Trigger</TableHead>
						<TableHead className="w-[100px]">Duration</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{dummyData.map((item) => (
						<TableRow data-status={item.status} className="group" key={item.id}>
							<TableCell>{item.time}</TableCell>
							<TableCell>
								<span
									className={clsx(
										"group-data-[status=success]:text-success",
										"group-data-[status=inProgress]:text-info",
										"group-data-[status=error]:text-error",
									)}
								>
									{item.status}
								</span>
							</TableCell>
							<TableCell>
								<div className="">
									{Object.entries(item.steps).map(([stepType, count]) => (
										<div key={stepType} className="flex items-center gap-[3px]">
											{stepType === "inProgress" && (
												<CircleDotIcon className="size-[13px] text-info" />
											)}
											{stepType === "success" && (
												<CircleCheckIcon className="size-[13px] text-success" />
											)}
											{stepType === "warning" && (
												<CircleAlertIcon className="size-[13px] text-warning" />
											)}
											{stepType === "error" && (
												<CircleXIcon className="size-[13px] text-error" />
											)}
											<span className="text-[11px]">{count}</span>
										</div>
									))}
								</div>
							</TableCell>
							<TableCell>{item.trigger}</TableCell>
							<TableCell>{item.duration}</TableCell>
							<TableCell />
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
