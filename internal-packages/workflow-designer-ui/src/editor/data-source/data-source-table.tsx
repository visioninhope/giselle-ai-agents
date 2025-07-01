import { Button } from "@giselle-internal/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@giselle-internal/ui/dialog";
import { EmptyState } from "@giselle-internal/ui/empty-state";
import { Select } from "@giselle-internal/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@giselle-internal/ui/table";
import clsx from "clsx/lite";
import { useGiselleEngine, useWorkflowDesigner } from "giselle-sdk/react";
import { PlusIcon } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { z } from "zod/v4";
import { useWorkspaceDataSources } from "../lib/use-workspace-data-sources";
import { GitHubConnectFieldsets } from "./provider/github";

const GitHubDataSourcePayload = z.object({
  provider: z.literal("github"),
  installationId: z.coerce.number(),
  repositoryNodeId: z.string(),
});

export function DataSourceTable() {
  const [presentDialog, setPresentDialog] = useState(false);
  const { data: workspace } = useWorkflowDesigner();
  const { isLoading, data, mutate } = useWorkspaceDataSources();
  const [isPending, startTransition] = useTransition();
  const client = useGiselleEngine();
  const [provider, setProvider] = useState<string | undefined>();

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const formDataObject = Object.fromEntries(formData.entries());
      const parse = GitHubDataSourcePayload.safeParse(formDataObject);
      if (!parse.success) {
        /** @todo Implement error handling */
        console.log(parse.error);
        return;
      }
      const payload = parse.data;
      startTransition(async () => {
        switch (payload.provider) {
          case "github": {
            const result = await client.createDataSource({
              workspaceId: workspace.id,
              dataSource: {
                provider: "github",
                providerMetadata: {
                  repositoryNodeId: payload.repositoryNodeId,
                  installationId: payload.installationId,
                },
              },
            });
            await mutate([...(data ?? []), result.dataSource]);
            break;
          }
          default: {
            const _exhaustiveCheck: never = payload.provider;
            throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
          }
        }
      });
      setPresentDialog(false);
    },
    [client, workspace.id, data, mutate],
  );

  if (isLoading) {
    return null;
  }
  return (
    <div className="px-[16px] pb-[16px] pt-[8px] h-full">
      <Dialog open={presentDialog} onOpenChange={setPresentDialog}>
        <DialogContent>
          <div className="py-[12px]">
            <DialogTitle>Add Data Source</DialogTitle>
            <DialogDescription>
              Connect to external data sources to query and use in your
              workflows.
            </DialogDescription>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-[12px]">
              <fieldset className="flex flex-col">
                <label
                  htmlFor="provider"
                  className="text-text text-[13px] mb-[2px]"
                >
                  Provider
                </label>
                <Select
                  name="provider"
                  options={[{ id: "github", label: "GitHub" }]}
                  renderOption={(option) => option.label}
                  placeholder="Select provider..."
                  value={provider}
                  onValueChange={setProvider}
                />
                <p className="text-[11px] text-text-muted px-[4px] mt-[1px]">
                  Currently, only GitHub is supported. More coming soon!
                </p>
              </fieldset>

              {provider === "github" && <GitHubConnectFieldsets />}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                variant="solid"
                size="large"
                disabled={isPending}
              >
                {isPending ? "..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {data === undefined || data.length < 1 ? (
        <EmptyState
          title="No data source connected."
          description="Add your first one below to start building."
        >
          <Button
            leftIcon={<PlusIcon />}
            onClick={() => setPresentDialog(true)}
          >
            Add Data Source
          </Button>
        </EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-sans">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
