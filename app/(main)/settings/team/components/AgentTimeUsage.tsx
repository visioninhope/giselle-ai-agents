import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type AgentTimeUsageProps = {
	/** 使用済みの時間（分） */
	usedMinutes: number;
	/** プランに含まれる制限時間（分） */
	includedMinutes?: number;
	/** 警告を表示する閾値（0-1の小数） */
	warningThreshold?: number;
};

function AgentTimeUsage(props: AgentTimeUsageProps) {
	const { usedMinutes, includedMinutes = 120, warningThreshold = 0.8 } = props;

	const percentage = (usedMinutes / includedMinutes) * 100;
	const isOverLimit = usedMinutes > includedMinutes;
	const isNearLimit =
		usedMinutes >= includedMinutes * warningThreshold && !isOverLimit;
	const remainingMinutes = includedMinutes - usedMinutes;
	const overMinutes = usedMinutes - includedMinutes;

	return (
		<div className="w-full p-6 rounded-lg space-y-4">
			<div className="flex justify-between items-baseline">
				<h2 className="text-lg text-slate-100">Agent Time Usage</h2>
				<div className="text-right">
					<div className="text-lg font-medium text-slate-100">
						{isOverLimit ? (
							<span>
								{includedMinutes}min +{" "}
								<span className="text-red-500">{overMinutes}min</span> used
							</span>
						) : (
							<span>{usedMinutes}min used</span>
						)}
					</div>
					<div className="text-sm text-slate-400">
						{Math.round(percentage)}% of your monthly limit used
					</div>
				</div>
			</div>

			<div className="relative w-full h-2">
				<div className="absolute w-full h-full rounded-full bg-slate-800" />
				{/* 基本の使用量（灰色） */}
				<div
					className="absolute h-full rounded-full bg-slate-400 transition-all duration-300"
					style={{
						width: `${Math.min(100, percentage)}%`,
					}}
				/>
				{/* 超過分（赤色） */}
				{isOverLimit && (
					<div
						className="absolute h-full rounded-r-full bg-red-500 transition-all duration-300"
						style={{
							width: `${(overMinutes / includedMinutes) * 100}%`,
							left: "100%",
							transform: "translateX(-100%)",
						}}
					/>
				)}
			</div>

			<div className="flex justify-between text-sm text-slate-400">
				<span>0min</span>
				<span>
					{isOverLimit ? `${usedMinutes}min` : `${includedMinutes}min`}
				</span>
			</div>

			<div className="text-sm text-slate-400">
				{includedMinutes} minutes included with Pro plan
			</div>

			{isNearLimit && (
				<Alert
					variant="warning"
					className="bg-yellow-950/30 border-yellow-500/20"
				>
					<AlertTriangle className="h-4 w-4 text-yellow-500" />
					<AlertDescription className="text-yellow-500">
						Only {remainingMinutes}{" "}
						{remainingMinutes === 1 ? "minute" : "minutes"} remaining in your
						Pro plan
						<div className="text-sm text-yellow-500/80">
							Additional usage will be billed at the standard rate
						</div>
					</AlertDescription>
				</Alert>
			)}

			{isOverLimit && (
				<Alert
					variant="destructive"
					className="bg-red-950/30 border-red-500/20"
				>
					<AlertTriangle className="h-4 w-4 text-red-500" />
					<AlertDescription className="text-red-500">
						{overMinutes} minutes over Pro plan limit
						<div className="text-sm text-red-500/80">
							Additional minutes will be billed at the standard rate
						</div>
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

export default AgentTimeUsage;
