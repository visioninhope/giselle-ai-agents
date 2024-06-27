import { getWorkflows } from "@/drizzle/db";

export default async function Page() {
	const workflows = await getWorkflows();
	return (
		<section className="mx-auto w-[800px] text-foreground mt-[100px]">
			<div className="flex flex-col gap-8">
				<h1>Workflows</h1>
				{workflows.map(({ id, slug }) => (
					<a
						key={id}
						className="border border-border p-4"
						href={`/workflows/${slug}`}
					>
						{slug}
					</a>
				))}
			</div>
		</section>
	);
}
