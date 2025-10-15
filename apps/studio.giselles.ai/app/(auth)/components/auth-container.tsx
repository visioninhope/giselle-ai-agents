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
		<h1 className="text-center font-sans text-[34px] font-[500] text-primary-100 auth-title-glow">
			{title}
		</h1>

		{/* Frosted-glass container */}
		<div className="relative w-full max-w-[360px] rounded-2xl pt-15 pb-7.5 px-10 flex flex-col shadow-(--shadow-stage-form) border border-transparent bg-clip-padding backdrop-blur-[8px] bg-(image:--glass-bg)">
			{/* Gradient border */}
			<div className="auth-gradient-border" />

			{/* Top highlight */}
			<div className="absolute left-4 right-4 top-0 h-px bg-(image:--glass-highlight-bg) pointer-events-none" />

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
