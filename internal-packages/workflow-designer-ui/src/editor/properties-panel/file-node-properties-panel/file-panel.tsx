import type {
	FileData,
	FileNode,
	UploadedFileData,
} from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import { ArrowUpFromLineIcon, FileXIcon, TrashIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toRelativeTime } from "../../../helper/datetime";
import { PdfFileIcon } from "../../../icons";
import { Tooltip } from "../../../ui/tooltip";
import { useFileNode } from "./use-file-node";

export function FilePanel({ node }: { node: FileNode }) {
	const [isDragging, setIsDragging] = useState(false);
	const [isValidPdf, setIsValidPdf] = useState(true);
	const { addFiles, removeFile } = useFileNode(node);

	const validatePdfFiles = useCallback((files: FileList | File[]) => {
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const isPdf =
				file.type === "application/pdf" ||
				file.name.toLowerCase().endsWith(".pdf");
			if (!isPdf) {
				return false;
			}
		}
		return true;
	}, []);

	const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);

		// Validate files during drag
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			let allPdf = true;

			for (let i = 0; i < e.dataTransfer.items.length; i++) {
				const item = e.dataTransfer.items[i];
				if (item.kind === "file" && item.type !== "application/pdf") {
					allPdf = false;
					break;
				}
			}

			setIsValidPdf(allPdf);
		}
	}, []);

	const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		setIsValidPdf(true); // Reset validation state
	}, []);

	const onDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);

			const files = Array.from(e.dataTransfer.files);
			if (validatePdfFiles(files)) {
				addFiles(files);
			} else {
				// Show error or feedback for invalid files
				setIsValidPdf(false);
				setTimeout(() => setIsValidPdf(true), 3000); // Reset validation UI after 3 seconds
			}
		},
		[addFiles, validatePdfFiles],
	);

	const onFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!e.target.files) {
				return;
			}

			const files = Array.from(e.target.files);
			if (validatePdfFiles(files)) {
				addFiles(files);
			} else {
				// Handle invalid files from file input
				// This generally shouldn't happen with accept="application/pdf"
				// But we'll keep this as a safety net
				alert("Only PDF files are allowed");
			}

			// Reset the file input to allow selecting the same files again
			e.target.value = "";
		},
		[addFiles, validatePdfFiles],
	);

	return (
		<div className="relative z-10 flex flex-col gap-[2px] h-full text-[14px] text-black-300">
			<div className="p-[16px] divide-y divide-black-50">
				{node.content.files.length > 0 && (
					<div className="pb-[16px] flex flex-col gap-[8px]">
						{node.content.files.map((file) => (
							<FileListItem
								key={file.id}
								fileData={file}
								onRemove={(uploadedFile) => removeFile(uploadedFile)}
							/>
						))}
					</div>
				)}
				<div className="py-[16px]">
					<div
						className={clsx(
							"group h-[300px] p-[8px]",
							"border border-black-400 rounded-[8px]",
							"data-[dragging=true]:data-[valid-pdf=false]:border-red-500",
						)}
						onDragOver={onDragOver}
						onDragLeave={onDragLeave}
						onDrop={onDrop}
						data-dragging={isDragging}
						data-valid-pdf={isValidPdf}
					>
						<div
							className={clsx(
								"h-full flex flex-col justify-center items-center gap-[16px] px-[24px] py-[10px]",
								"border border-dotted rounded-[8px] border-transparent",
								"group-data-[dragging=true]:border-black-400",
								"group-data-[dragging=true]:group-data-[valid-pdf=false]:border-red-500",
							)}
						>
							{isDragging ? (
								<>
									{isValidPdf ? (
										<>
											<PdfFileIcon className="size-[30px] text-black-400" />
											<p className="text-center text-white-400">
												Drop to upload your PDF files
											</p>
										</>
									) : (
										<>
											<FileXIcon className="size-[30px] text-red-500" />
											<p className="text-center text-red-500">
												Only PDF files are allowed
											</p>
										</>
									)}
								</>
							) : (
								<div className="flex flex-col gap-[16px] justify-center items-center">
									<ArrowUpFromLineIcon size={38} className="text-black-400" />
									<label
										htmlFor="file"
										className="text-center flex flex-col gap-[16px] text-white-400"
									>
										<p>Drop PDF files here to upload.</p>
										<div className="flex gap-[8px] justify-center items-center">
											<span>or</span>
											<span className="font-bold text-[14px] underline cursor-pointer">
												Select PDF files
												<input
													accept="application/pdf"
													multiple
													id="file"
													type="file"
													onChange={onFileChange}
													className="hidden"
												/>
											</span>
										</div>
									</label>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function FileListItem({
	fileData,
	onRemove,
}: {
	fileData: FileData;
	onRemove: (file: UploadedFileData) => void;
}) {
	return (
		<div className="flex items-center overflow-x-hidden group justify-between bg-black-100 hover:bg-white-900/10 transition-colors p-[8px] rounded-[8px]">
			<div className="flex items-center overflow-x-hidden">
				<div className="overflow-x-hidden">
					<p className="truncate">{fileData.name}</p>
					{fileData.status === "uploading" && <p>Uploading...</p>}
					{fileData.status === "uploaded" && (
						<p className="text-black-50">
							{toRelativeTime(fileData.uploadedAt)}
						</p>
					)}
					{fileData.status === "failed" && <p>Failed</p>}
				</div>
			</div>
			{fileData.status === "uploaded" && (
				<Tooltip text="Remove">
					<button
						type="button"
						className="hidden group-hover:block px-[4px] py-[4px] bg-transparent hover:bg-white-900/10 rounded-[8px] transition-colors mr-[2px] flex-shrink-0"
						onClick={() => onRemove(fileData)}
					>
						<TrashIcon className="w-[24px] h-[24px] stroke-current stroke-[1px] " />
					</button>
				</Tooltip>
			)}
		</div>
	);
}
