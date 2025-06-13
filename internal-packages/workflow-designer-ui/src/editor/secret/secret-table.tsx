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
							<TableCell>{data.createdAt}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
