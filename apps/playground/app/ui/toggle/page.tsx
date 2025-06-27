import { Toggle } from "@giselle-internal/ui/toggle";

export default function () {
	return (
		<>
			<h2 className="text-text mb-6">Toggle</h2>
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Demo</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Toggle name="toggle" />
						</div>
					</div>
				</div>
				<div>
					<p className="text-text mb-2 text-sm">With label</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Toggle name="toggle">
								<label className="text-[14px]" htmlFor="hello">
									Toggle
								</label>
								<div className="flex-grow mx-[12px] h-[1px] bg-black-200/30" />
							</Toggle>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
