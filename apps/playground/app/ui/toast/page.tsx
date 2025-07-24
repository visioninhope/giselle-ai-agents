"use client";

import { Button } from "@giselle-internal/ui/button";
import { ToastProvider, useToasts } from "@giselle-internal/ui/toast";
import { DemoSection } from "../components/demo-section";
import { UiPage } from "../components/ui-page";

function ToastDemo() {
	const toast = useToasts();

	return (
		<>
			<DemoSection label="Info Toast">
				<Button
					variant="filled"
					onClick={() => toast.info("This is an info message")}
				>
					Show Info Toast
				</Button>
			</DemoSection>

			<DemoSection label="Error Toast">
				<Button
					variant="filled"
					onClick={() => toast.error("This is an error message")}
				>
					Show Error Toast
				</Button>
			</DemoSection>

			<DemoSection label="Toast with Action">
				<Button
					variant="filled"
					onClick={() =>
						toast.info("File uploaded successfully", {
							action: (
								<Button
									variant="outline"
									size="compact"
									onClick={() => console.log("Undo clicked")}
								>
									Undo
								</Button>
							),
						})
					}
				>
					Show Toast with Action
				</Button>
			</DemoSection>

			<DemoSection label="Multiple Toasts">
				<Button
					variant="filled"
					onClick={() => {
						toast.info("First toast message");
						setTimeout(() => toast.info("Second toast message"), 500);
						setTimeout(() => toast.error("Third toast (error)"), 1000);
					}}
				>
					Show Multiple Toasts
				</Button>
			</DemoSection>
		</>
	);
}

export default function () {
	return (
		<ToastProvider>
			<UiPage title="Toast">
				<ToastDemo />
			</UiPage>
		</ToastProvider>
	);
}
