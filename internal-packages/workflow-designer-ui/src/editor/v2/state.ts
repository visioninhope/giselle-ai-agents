export type LeftPanelValue = "run-history" | "secret" | "data-source";
export interface V2LayoutState {
	leftPanel: LeftPanelValue | null;
}
