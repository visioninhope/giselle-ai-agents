import type { ReactNode } from "react";
import { EmailProvider } from "./contexts";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="h-screen w-screen flex items-center justify-center">
			<div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
				<EmailProvider>
					{children}
					<div className="hidden bg-muted lg:block w-full h-full" />
				</EmailProvider>
			</div>
		</div>
	);
}
