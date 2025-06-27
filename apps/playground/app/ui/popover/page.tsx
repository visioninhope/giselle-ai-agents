"use client";

import { Button } from "@giselle-internal/ui/button";
import { Popover } from "@giselle-internal/ui/popover";

export default function () {
	return (
		<>
			<h2 className="text-text mb-6">Dropdown Menu</h2>
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Demo</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Popover trigger={<Button>Hello</Button>}>
								<p>content</p>
							</Popover>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
