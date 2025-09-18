import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { docVectorStoreFlag } from "@/flags";
import { createDocumentVectorStore } from "../actions";
import { DocumentVectorStoreCreateDialog } from "../document-store-create-dialog";

export default async function DocumentVectorStorePage() {
	const enabled = await docVectorStoreFlag();
	if (!enabled) {
		return notFound();
	}

	return (
		<div className="flex flex-col gap-[24px]">
			<div className="flex justify-between items-center">
				<h1
					className="text-[30px] font-sans font-medium text-[hsl(192,73%,84%)]"
					style={{
						textShadow: "0 0 20px #0087f6, 0 0 40px #0087f6, 0 0 60px #0087f6",
					}}
				>
					Vector Stores
				</h1>
				<div className="flex items-center gap-4">
					<a
						href="https://docs.giselles.ai/guides/settings/team/vector-store"
						target="_blank"
						rel="noopener noreferrer"
						className="text-black-300 text-[14px] font-medium rounded-[4px] px-1.5 py-0.5 hover:bg-black-300/10 flex items-center gap-1.5 font-sans"
					>
						About Vector Stores
						<ExternalLink size={14} />
					</a>
					<DocumentVectorStoreCreateDialog
						createAction={createDocumentVectorStore}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-y-[16px]">
				<Card className="rounded-[8px] bg-transparent p-6 border-0">
					<div className="flex items-center mb-4">
						<div>
							<h4 className="text-white-400 font-medium text-[18px] leading-[21.6px] font-sans">
								Document Vector Stores
							</h4>
							<p className="text-black-400 text-[14px] leading-[20.4px] font-geist mt-1">
								Create and manage Vector Stores for your documents. PDF
								ingestion and search will be available here.
							</p>
						</div>
					</div>
					<div className="text-black-300 text-center py-16 bg-black-300/10 rounded-lg">
						<div>No document vector stores yet.</div>
						<div>Use the "New Vector Store" button to create one.</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
