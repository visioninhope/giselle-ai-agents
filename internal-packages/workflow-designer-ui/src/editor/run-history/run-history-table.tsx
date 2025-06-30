export function RunHistoryTable() {
	return (
		<div className="p-4 h-full">
			<div className="overflow-auto h-full">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-white-400/20">
							<th className="text-left py-3 px-4 text-white-400 font-normal text-xs">
								Time
							</th>
							<th className="text-left py-3 px-4 text-white-400 font-normal text-xs">
								Status
							</th>
							<th className="text-left py-3 px-4 text-white-400 font-normal text-xs">
								Steps
							</th>
							<th className="text-left py-3 px-4 text-white-400 font-normal text-xs">
								Trigger
							</th>
							<th className="text-left py-3 px-4 text-white-400 font-normal text-xs">
								Duration
								<br />
								<span className="whitespace-nowrap">(Wall-Clock)</span>
							</th>
							<th className="text-left py-3 px-4 text-white-400 font-normal text-xs">
								Duration
								<br />
								<span className="whitespace-nowrap">(Total tasks)</span>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr className="border-b border-white-400/10">
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2025/06/18 16:55
							</td>
							<td className="py-3 px-4 whitespace-nowrap">
								<span className="text-[#39FF7F]">completed</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								<span className="inline-flex items-center gap-1">
									<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
										✓
									</span>
									<span className="text-xs">2</span>
								</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								manual
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2.1s
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2.5s
							</td>
						</tr>
						<tr className="border-b border-white-400/10">
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2025/06/18 16:12
							</td>
							<td className="py-3 px-4 whitespace-nowrap">
								<span className="text-[#39FF7F]">completed</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								<span className="inline-flex items-center gap-1">
									<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
										✓
									</span>
									<span className="text-xs">2</span>
								</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								manual
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2.1s
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2.5s
							</td>
						</tr>
						<tr className="border-b border-white-400/10">
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2025/06/18 16:13
							</td>
							<td className="py-3 px-4 whitespace-nowrap">
								<span className="text-[#39FF7F]">completed</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								<span className="inline-flex items-center gap-1">
									<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
										✓
									</span>
									<span className="text-xs">2</span>
								</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								manual
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								1.7s
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2.1s
							</td>
						</tr>
						<tr className="border-b border-white-400/10">
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2025/06/18 16:14
							</td>
							<td className="py-3 px-4 whitespace-nowrap">
								<span className="text-[#39FF7F]">completed</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								<span className="inline-flex items-center gap-1">
									<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
										✓
									</span>
									<span className="text-xs">2</span>
								</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								manual
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								1.1s
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								1.5s
							</td>
						</tr>
						<tr className="border-b border-white-400/10">
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2025/06/18 16:15
							</td>
							<td className="py-3 px-4 whitespace-nowrap">
								<span className="text-[#39FF7F]">completed</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								<span className="inline-flex items-center gap-1">
									<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
										✓
									</span>
									<span className="text-xs">2</span>
								</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								manual
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								1.6s
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2.0s
							</td>
						</tr>
						<tr className="border-b border-white-400/10">
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2025/06/18 16:16
							</td>
							<td className="py-3 px-4 whitespace-nowrap">
								<span className="text-[#39FF7F]">completed</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								<span className="inline-flex items-center gap-1">
									<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
										✓
									</span>
									<span className="text-xs">2</span>
								</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								manual
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								1.7s
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2.0s
							</td>
						</tr>
						<tr className="border-b border-white-400/10">
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2025/06/18 16:16
							</td>
							<td className="py-3 px-4 whitespace-nowrap">
								<span className="text-[#39FF7F]">completed</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								<span className="inline-flex items-center gap-1">
									<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
										✓
									</span>
									<span className="text-xs">2</span>
								</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								manual
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								1.2s
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								1.5s
							</td>
						</tr>
						<tr className="border-b border-white-400/10">
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2025/06/18 16:19
							</td>
							<td className="py-3 px-4 whitespace-nowrap">
								<span className="text-[#FF3D71]">failed</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								<span className="inline-flex items-center gap-1">
									<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
										✓
									</span>
									<span className="text-xs">1</span>
									<span className="w-4 h-4 rounded-full bg-[#FF3D71] text-black text-xs flex items-center justify-center font-bold">
										✕
									</span>
									<span className="text-xs">1</span>
								</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								manual
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								1.1s
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								1.0s
							</td>
						</tr>
						<tr className="border-b border-white-400/10">
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2025/06/18 16:20
							</td>
							<td className="py-3 px-4 whitespace-nowrap">
								<span className="text-[#FFE551]">warning</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								<span className="inline-flex items-center gap-1">
									<span className="w-4 h-4 rounded-full bg-[#39FF7F] text-black text-xs flex items-center justify-center font-bold">
										✓
									</span>
									<span className="text-xs">1</span>
									<span className="w-4 h-4 rounded-full bg-[#FFE551] text-black text-xs flex items-center justify-center font-bold">
										!
									</span>
									<span className="text-xs">1</span>
								</span>
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								manual
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								1.8s
							</td>
							<td className="py-3 px-4 text-white-800 whitespace-nowrap">
								2.2s
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
