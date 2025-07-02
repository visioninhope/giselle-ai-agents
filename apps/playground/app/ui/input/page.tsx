import { Input } from "@giselle-internal/ui/input";

export default function () {
	return (
		<>
			<h2 className="text-text mb-6">Input</h2>
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Demo</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Input placeholder="Type here..." />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
