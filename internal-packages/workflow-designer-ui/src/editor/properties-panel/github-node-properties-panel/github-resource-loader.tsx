"use client";

import clsx from "clsx/lite";
import { useGiselleEngine } from "giselle-sdk/react";
import { ExternalLink, Github, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { GitHubIcon } from "../../../icons";

interface ClippedContent {
	id: string;
	url: string;
	title: string;
	content: string;
	timestamp: number;
}

export function GitHubResourceLoader() {
	const [url, setUrl] = useState("");
	const [resources, setResources] = useState<ClippedContent[]>([]);
	const [activeTab, setActiveTab] = useState("all");
	const [isLoading, setIsLoading] = useState(false);
	const [currentLoadingUrl, setCurrentLoadingUrl] = useState<string | null>(
		null,
	);

	const client = useGiselleEngine();

	const handleAddUrl = async () => {
		if (!url.trim() || !isValidUrl(url)) return;

		// Check if URL is from GitHub
		if (!url.includes("github.com")) {
			alert("Please enter a GitHub URL");
			return;
		}

		const id = await client.githubUrlToObjectId({ url });

		alert(id);
		setCurrentLoadingUrl(url);
		setIsLoading(true);

		// try {
		// 	if (result.success) {
		// 		const newResource: ClippedContent = {
		// 			id: Date.now().toString(),
		// 			url: url,
		// 			title: result.title || "No Title",
		// 			content: result.content || "No content found",
		// 			timestamp: Date.now(),
		// 		};

		// 		setResources((prev) => [newResource, ...prev]);
		// 		setUrl("");
		// 	} else {
		// 		alert(`Failed to fetch content: ${result.error}`);
		// 	}
		// } catch (error) {
		// 	console.error("Error fetching URL:", error);
		// 	alert("Failed to fetch content. Please try again.");
		// } finally {
		// 	setIsLoading(false);
		// 	setCurrentLoadingUrl(null);
		// }
	};

	const handleRemoveResource = (id: string) => {
		setResources((prev) => prev.filter((item) => item.id !== id));
	};

	const isValidUrl = (string: string) => {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};

	return (
		<div className="space-y-4">
			<div className="flex gap-2 justify-start">
				<input
					type="url"
					placeholder="Enter GitHub URL (e.g., https://github.com/username/repo)"
					className="border-[0.5px] border-white-900 rounded-[6px] p-[8px] outline-none focus:outline-none w-full"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleAddUrl();
					}}
					disabled={isLoading}
				/>
				<button
					type="button"
					onClick={handleAddUrl}
					disabled={isLoading || !url.trim() || !isValidUrl(url)}
					className={clsx(
						"flex py-[8px] px-[16px] justify-center items-center gap-[4px]",
						"rounded-[8px]",
						"bg-primary-900 text-[14px] text-white-900",
						"cursor-pointer",
					)}
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Loading...
						</>
					) : (
						<>
							<GitHubIcon className="mr-2 h-4 w-4" />
							Load
						</>
					)}
				</button>
			</div>

			{/* <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-1">
					<TabsTrigger value="all">
						Loaded Resources ({resources.length})
					</TabsTrigger>
				</TabsList>
				<TabsContent value="all" className="mt-4">
					{resources.length === 0 ? (
						<Card>
							<CardContent className="p-6 text-center text-muted-foreground">
								No GitHub resources loaded yet. Add a GitHub URL above to get
								started.
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{resources.map((item) => (
								<Card key={item.id} className="overflow-hidden">
									<CardHeader className="p-4 pb-2">
										<div className="flex justify-between items-start">
											<CardTitle className="text-lg font-medium">
												{item.title}
											</CardTitle>
											<div className="flex gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => window.open(item.url, "_blank")}
													title="Open original URL"
												>
													<ExternalLink className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleRemoveResource(item.id)}
													title="Remove resource"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											{formatDate(item.timestamp)}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											{item.url}
										</p>
									</CardHeader>
									<CardContent className="p-4 pt-2">
										<ScrollArea className="h-[300px] rounded-md border p-4">
											<div
												className="prose prose-sm max-w-none dark:prose-invert"
												dangerouslySetInnerHTML={{ __html: item.content }}
											/>
										</ScrollArea>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs> */}
		</div>
	);
}
