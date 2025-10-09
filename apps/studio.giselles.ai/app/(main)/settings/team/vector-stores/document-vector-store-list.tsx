import { Card } from "@/components/ui/card";
import type { DocumentVectorStoreId } from "@/packages/types";
import type { DocumentVectorStoreWithProfiles } from "./data";
import { DocumentVectorStoreItem } from "./document/document-vector-store-item";
import type { ActionResult, DocumentVectorStoreUpdateInput } from "./types";

type DocumentVectorStoreListProps = {
	stores: DocumentVectorStoreWithProfiles[];
	deleteAction: (
		documentVectorStoreId: DocumentVectorStoreId,
	) => Promise<ActionResult>;
	updateAction: (
		documentVectorStoreId: DocumentVectorStoreId,
		input: DocumentVectorStoreUpdateInput,
	) => Promise<ActionResult>;
};

export function DocumentVectorStoreList({
	stores,
	deleteAction,
	updateAction,
}: DocumentVectorStoreListProps) {
	return (
		<div className="flex flex-col gap-y-[16px]">
			<Card className="rounded-[8px] bg-transparent p-6 border-0">
				<div className="flex items-center mb-4">
					<div>
						<h4 className="text-inverse font-medium text-[18px] leading-[21.6px] font-sans">
							Document Vector Stores
						</h4>
						<p className="text-black-400 text-[14px] leading-[20.4px] font-geist mt-1">
							Manage the vector stores configured for document ingestion.
						</p>
					</div>
				</div>

				{stores.length > 0 ? (
					<div className="space-y-4">
						{stores.map((store) => (
							<DocumentVectorStoreItem
								key={store.id}
								store={store}
								deleteAction={deleteAction}
								updateAction={updateAction}
							/>
						))}
					</div>
				) : (
					<EmptyDocumentVectorStoreCard />
				)}
			</Card>
		</div>
	);
}

function EmptyDocumentVectorStoreCard() {
	return (
		<div className="text-black-300 text-center py-16 bg-surface rounded-lg">
			<div>No document vector stores yet.</div>
			<div>Use the "New Vector Store" button to create one.</div>
		</div>
	);
}
