import type { LeftPanelValue } from "../v2/state";

export interface PanelConfig {
	title: string;
	minWidth: number;
	defaultWidth: number;
	maxWidth: number;
}

export const panelConfigs: Record<LeftPanelValue, PanelConfig> = {
	"run-history": {
		title: "Run History",
		minWidth: 500,
		defaultWidth: 650,
		maxWidth: 1000,
	},
	secret: {
		title: "Secrets",
		minWidth: 300,
		defaultWidth: 400,
		maxWidth: 600,
	},
	"data-source": {
		title: "Data Source",
		minWidth: 350,
		defaultWidth: 450,
		maxWidth: 700,
	},
} as const;
