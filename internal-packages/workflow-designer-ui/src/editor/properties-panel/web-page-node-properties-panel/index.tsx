import {
	type WebPage,
	WebPageId,
	type WebPageNode,
} from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import { useGiselleEngine, useWorkflowDesigner } from "giselle-sdk/react";
import { LoaderIcon } from "lucide-react";
import { type FormEventHandler, useCallback, useTransition } from "react";
import { WebPageFileIcon } from "../../../icons";
import {
	PropertiesPanelContent,
	PropertiesPanelHeader,
	PropertiesPanelRoot,
} from "../ui";

export function WebPageNodePropertiesPanel({ node }: { node: WebPageNode }) {
	const client = useGiselleEngine();
	const { data, updateName, updateNodeDataContent } = useWorkflowDesigner();
	// const { url, setUrl, provider, setProvider, parse, setParse } =
	// 	useWebPageNode(node);
	const [isPending, startTransition] = useTransition();
	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		(e) => {
			e.preventDefault();

			const formData = new FormData(e.currentTarget);
			const urls = formData.get("urls")?.toString().split("\n") || [];
			if (urls.length === 0) {
				// @todo show error
				return;
			}

			let webpages: WebPage[] = node.content.webpages;
			startTransition(async () => {
				await Promise.all(
					urls.map(async (url) => {
						const newWebPage: WebPage = {
							id: WebPageId.generate(),
							status: "fetching",
							url,
						};
						webpages = [...webpages, newWebPage];
						updateNodeDataContent(node, {
							webpages,
						});
						const addedWebPage = await client.addWebPage({
							webpage: newWebPage,
							workspaceId: data.id,
						});
						webpages = [
							...webpages.filter((webpage) => webpage.id !== addedWebPage.id),
							addedWebPage,
						];
						updateNodeDataContent(node, {
							webpages,
						});
					}),
				);
			});
		},
		[client, data.id, node, updateNodeDataContent],
	);

	return (
		<PropertiesPanelRoot>
			<PropertiesPanelHeader
				icon={<WebPageFileIcon className="size-[20px] text-black-900" />}
				node={node}
				onChangeName={(name) => updateName(name)}
			/>
			<PropertiesPanelContent>
				<div>
					<ul>
						{node.content.webpages.map((webpage) => (
							<li
								key={webpage.id}
								className="bg-black-750 px-[8px] py-[4px] flex items-center justify-between"
							>
								{webpage.status === "fetched" && (
									<div>
										<p>{webpage.title}</p>
										<a
											href={webpage.url}
											target="_blank"
											rel="noreferrer"
											className="text-[14px] underline"
										>
											{webpage.url}
										</a>
									</div>
								)}
							</li>
						))}
					</ul>
					<form
						className="p-[4px] flex flex-col gap-[8px]"
						onSubmit={handleSubmit}
					>
						<div className="flex flex-col gap-[8px]">
							<label
								htmlFor="webpage-urls"
								className="font-semibold text-white-800"
							>
								URLs (one per line)
							</label>
							<textarea
								id="webpage-urls"
								name="urls"
								className={clsx(
									"w-full min-h-[80px] p-[8px] border-[2px] border-black-400 rounded-[8px] bg-black-100 text-white-800 outline-none resize-none",
									// urlError && "border-error-900",
								)}
								// value={urls}
								// onChange={(e) => setUrls(e.target.value)}
								placeholder={"https://example.com\nhttps://docs.giselles.ai"}
								required
							/>
							{/* {urlError && (
							<p className="text-error-900 text-[12px]">{urlError}</p>
						)} */}
						</div>
						<button
							type="submit"
							className="w-fit flex items-center gap-[4px] px-[16px] py-[8px] rounded-[8px] bg-blue-700 text-white-800 font-semibold hover:bg-blue-800 disabled:bg-black-400 cursor-pointer transition-colors"
							disabled={isPending}
						>
							{isPending && <LoaderIcon className="size-[14px] animate-spin" />}
							{isPending ? "Inserting" : "Insert"}
						</button>
					</form>
				</div>
			</PropertiesPanelContent>
		</PropertiesPanelRoot>
	);
}
