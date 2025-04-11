import type { ReactNode } from "react";
import LayoutV2 from "./v2/layout";

export default async function Layout({ children }: { children: ReactNode }) {
	return <LayoutV2>{children}</LayoutV2>;
}
