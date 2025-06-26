import { NavLink } from "./nav-link";

const components = [
	{
		id: "button",
		name: "Button",
	},
	{
		id: "dialog",
		name: "Dialog",
	},
	{
		id: "select",
		name: "Select",
	},
];
export default function ({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-surface-background font-mono">
			<div className="flex">
				<div className="w-64 border-r border-border min-h-screen">
					<div className="p-6">
						<h1 className="text-text mb-6">Components</h1>
						<nav className="gap-1 flex flex-col">
							{components.map((component) => (
								<NavLink key={component.id} pathname={`/ui/${component.id}`}>
									{component.name}
								</NavLink>
							))}
						</nav>
					</div>
				</div>

				<div className="flex-1 p-8">
					<main className="max-w-4xl">{children}</main>
				</div>
			</div>
		</div>
	);
}
