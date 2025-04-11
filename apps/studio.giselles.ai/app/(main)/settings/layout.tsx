import type { ReactNode } from "react";
import SettingsLayoutV2 from "./settings-layout-v2";

export default async function SettingsLayout({
	children,
}: { children: ReactNode }) {
	return <SettingsLayoutV2>{children}</SettingsLayoutV2>;
}
