import { Button } from "@giselle-internal/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from "@giselle-internal/ui/dialog";

export default function () {
	return (
		<>
			<h2 className="text-text mb-6">Button</h2>
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Demo</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Dialog>
								<DialogTrigger asChild>
									<Button variant="filled">Add Data Source</Button>
								</DialogTrigger>
								<DialogContent>
									<div className="py-[12px]">
										<DialogTitle>Add Data Source </DialogTitle>
										<DialogDescription>
											Enter a name and value for the secret.
										</DialogDescription>
									</div>
									<div>
										<p>Contents</p>
										<DialogFooter>
											<div className="flex items-center gap-[6px]">
												<Button type="button" variant="outline" size="large">
													Cancel
												</Button>
												<Button type="button" variant="solid" size="large">
													Create
												</Button>
											</div>
										</DialogFooter>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
