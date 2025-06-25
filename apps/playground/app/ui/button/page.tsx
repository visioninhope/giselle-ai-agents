import { Button } from "@giselle-internal/ui/button";

export default function () {
	return (
		<>
			<h2 className="text-text mb-6">Button</h2>
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Style</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Button>Subtle(default)</Button>
							<Button variant="filled">Filled</Button>
							<Button variant="solid">Solid</Button>
							<Button variant="glass">Glass</Button>
						</div>
					</div>
				</div>
				<div>
					<p className="text-text mb-2 text-sm">Size</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Button variant="glass">default</Button>
							<Button variant="glass" size="large">
								Large
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
