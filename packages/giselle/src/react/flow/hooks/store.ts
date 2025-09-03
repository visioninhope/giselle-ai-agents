import { create } from "zustand";
import { createFileSlice, type FileSlice } from "./fileSlice";
import {
	createPropertiesPanelSlice,
	type PropertiesPanelSlice,
} from "./propertiesPanelSlice";
import { createViewSlice, type ViewSlice } from "./viewSlice";
import { createWorkspaceSlice, type WorkspaceSlice } from "./workspaceSlice";

// The full store type is the intersection of all slice types
export type AppStore = WorkspaceSlice &
	ViewSlice &
	FileSlice &
	PropertiesPanelSlice;

export const useAppStore = create<AppStore>()((...a) => ({
	...createWorkspaceSlice(...a),
	...createViewSlice(...a),
	...createFileSlice(...a),
	...createPropertiesPanelSlice(...a),
}));
