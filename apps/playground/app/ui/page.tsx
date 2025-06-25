"use client";

import { Button } from "@giselle-internal/ui/button";
import { useState } from "react";

const components = [
	{
		id: "button",
		name: "Button",
		component: (
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Style</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Button>Subtle(default)</Button>
							<Button variant="filled">Filled</Button>
							<Button variant="solid">Solid</Button>
							<Button variant="glassmorphic">Glassmorphic</Button>
						</div>
					</div>
				</div>
				<div>
					<p className="text-text mb-2 text-sm">Size</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Button variant="glassmorphic">default</Button>
							<Button variant="glassmorphic" size="large">
								Large
							</Button>
						</div>
					</div>
				</div>
			</div>
		),
	},
] as const;

export default function ComponentShowcase() {
	const [selectedComponent, setSelectedComponent] = useState(components[0]);

	return (
		<div className="min-h-screen bg-surface-background font-mono">
			<div className="flex">
				<div className="w-64 border-r border-border min-h-screen">
					<div className="p-6">
						<h1 className="text-text mb-6">Components</h1>
						<nav className="space-y-1">
							{components.map((component) => (
								<button
									type="button"
									key={component.id}
									onClick={() => setSelectedComponent(component)}
									className={`w-full text-left px-3 py-2 rounded-[4px] text-sm font-medium transition-colors ${
										selectedComponent.id === component.id
											? "text-text bg-ghost-element-selected"
											: "text-text-muted hover:bg-ghost-element-hover"
									}`}
								>
									{component.name}
								</button>
							))}
						</nav>
					</div>
				</div>

				<div className="flex-1 p-8">
					<div className="max-w-4xl">
						<h2 className="text-text mb-6">{selectedComponent.name}</h2>
						{selectedComponent.component}
					</div>
				</div>
			</div>
		</div>
	);
}
