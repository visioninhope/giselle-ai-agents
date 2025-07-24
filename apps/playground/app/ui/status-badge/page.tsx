import { StatusBadge } from "@giselle-internal/ui/status-badge";
import { DemoSection } from "../components/demo-section";
import { UiPage } from "../components/ui-page";

export default function () {
	return (
		<UiPage title="StatusBadge">
			<DemoSection label="Status Variants">
				<StatusBadge status="success">Success</StatusBadge>
				<StatusBadge status="error">Error</StatusBadge>
				<StatusBadge status="info">Info</StatusBadge>
				<StatusBadge status="ignored">Ignored</StatusBadge>
			</DemoSection>
			<DemoSection label="With Custom Content">
				<StatusBadge status="success">✓ Completed</StatusBadge>
				<StatusBadge status="error">✗ Failed</StatusBadge>
				<StatusBadge status="info">ℹ Processing</StatusBadge>
				<StatusBadge status="ignored">— Skipped</StatusBadge>
			</DemoSection>
			<DemoSection label="Different Text Lengths">
				<StatusBadge status="success">OK</StatusBadge>
				<StatusBadge status="error">Authentication Failed</StatusBadge>
				<StatusBadge status="info">In Progress...</StatusBadge>
				<StatusBadge status="ignored">Not Applicable</StatusBadge>
			</DemoSection>
		</UiPage>
	);
}
