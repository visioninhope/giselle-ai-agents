import type { ReactNode } from "react";
import { ToastProvider } from "@/packages/contexts/toast";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<ToastProvider>
			<div className="h-full bg-surface">{children}</div>
		</ToastProvider>
	);
}
