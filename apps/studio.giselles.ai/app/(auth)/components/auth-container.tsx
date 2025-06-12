import type { FC, ReactNode } from "react";

interface AuthContainerProps {
	title: string;
	subtitle?: string;
	children: ReactNode;
}

export const AuthContainer: FC<AuthContainerProps> = ({
	title,
	subtitle,
	children,
}) => (
	<div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
		<h1 className="text-center font-sans text-[34px] font-[500] text-[hsl(192,73%,84%)] [text-shadow:0px_0px_20px_#0087f6]">
			{title}
		</h1>

		{/* Frosted-glass container */}
		<div className="relative w-full max-w-[360px] rounded-2xl pt-15 pb-7.5 px-10 flex flex-col shadow-lg shadow-black/30 border border-transparent bg-clip-padding backdrop-blur-[8px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_80%,rgba(255,255,255,0)_100%)]">
			{/* Gradient border */}
			<div className="auth-gradient-border" />

			{/* Corner dots */}
			<div className="auth-corner-dot auth-corner-dot--top-left" />
			<div className="auth-corner-dot auth-corner-dot--top-right" />
			<div className="auth-corner-dot auth-corner-dot--bottom-left" />
			<div className="auth-corner-dot auth-corner-dot--bottom-right" />

			{subtitle && (
				<div className="auth-container-header">
					<h2 className="auth-container-title">{subtitle}</h2>
				</div>
			)}

			{children}
		</div>
	</div>
);

interface AuthContainerHeaderProps {
	title: string;
	description?: string;
}

export const AuthContainerHeader: FC<AuthContainerHeaderProps> = ({
	title,
	description,
}) => (
	<div className="auth-container-header">
		<h2 className="auth-container-title">{title}</h2>
		{description && <p className="auth-container-description">{description}</p>}
	</div>
);
