export type LeftPanelValue = "run-history" | "secret" | "data-source" | "chat";
export interface V2LayoutState {
	leftPanel: LeftPanelValue | null;
}
