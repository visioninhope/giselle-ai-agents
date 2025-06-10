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
		<h1 className="auth-main-title">{title}</h1>

		{/* Frosted-glass container */}
		<div className="auth-glass-container">
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
