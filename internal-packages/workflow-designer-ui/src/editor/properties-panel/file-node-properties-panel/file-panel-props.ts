import type { FileNode } from "@giselle-sdk/data-type";
import type { FileTypeConfig } from "./file-type-config";

export type FilePanelProps = {
	node: FileNode;
	config: FileTypeConfig;
};
