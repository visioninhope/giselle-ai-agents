import { EmptyState } from "@giselle-internal/ui/empty-state";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@giselle-internal/ui/table";
import { useWorkspaceSecrets } from "../lib/use-workspace-secrets";

function formatDateTime(timestamp: number): string {
	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${year}/${month}/${day} ${hours}:${minutes}`;
}

export function SecretTable() {
	const { isLoading, data } = useWorkspaceSecrets();
	if (isLoading) {
		return null;
	}
	if (data === undefined || data.length < 1) {
		return <EmptyState description="No secret" />;
	}
	return (
		<div className="p-[16px] bg-surface-background h-full">
			<h1 className="font-accent text-text text-[18px] mb-[8px]">Secrets</h1>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Created at</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((data) => (
						<TableRow key={data.id}>
							<TableCell>{data.label}</TableCell>
							<TableCell>{formatDateTime(data.createdAt)}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
