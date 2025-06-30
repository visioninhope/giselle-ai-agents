import { Select } from "@giselle-internal/ui/select";

export default function () {
	return (
		<>
			<h2 className="text-text mb-6">Select</h2>
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Demo</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Select
								name="repositoryNodeId"
								options={[
									{ id: 1, name: "apple" },
									{ id: 2, name: "banana" },
									{ id: 3, name: "melon" },
								]}
								renderOption={(option) => option.name}
								placeholder="Select apple..."
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
