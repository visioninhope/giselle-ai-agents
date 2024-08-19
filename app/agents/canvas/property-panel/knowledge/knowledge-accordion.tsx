import { useBlueprint } from "@/app/agents/blueprints";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { createTemporaryId } from "@/lib/create-temporary-id";
import { createKnowledge } from "@/services/knowledges/actions";
import {
	BookOpenIcon,
	HardDriveUploadIcon,
	TextIcon,
	TrashIcon,
	UploadIcon,
} from "lucide-react";

import type { FC } from "react";
import invariant from "tiny-invariant";

export const KnowledgeAccordion: FC = () => {
	const { blueprint, mutate } = useBlueprint();
	return (
		<div className="px-4 py-2 gap-4 flex flex-col">
			<Accordion type="single" collapsible className="w-full">
				{blueprint.knowledges.map(({ id, name, files }) => (
					<AccordionItem value={name} key={id}>
						<AccordionTrigger handlePosition="right" className="flex gap-2">
							<BookOpenIcon className="w-4 h-4" />
							<p>{name}</p>
						</AccordionTrigger>
						<AccordionContent className="flex flex-col gap-2">
							<ul className="list-disc list-inside">
								{files.length === 0 && (
									<div className="flex justify-center flex-col items-center py-8 px-4 bg-muted rounded gap-4">
										<div className="">
											<BookOpenIcon className="w-8 h-8" strokeWidth={1} />
										</div>
										<p className="text-center text-xs">
											No knowledge added yet. Add PDFs, documents or other
											<br />
											text to knowledge base that Claude will
											<br />
											reference in every project conversation.
										</p>
									</div>
								)}
								{files.map(({ id, fileName }) => (
									<li
										key={id}
										className="flex items-center justify-between py-1"
									>
										<span>{fileName}</span>
										<Button variant="ghost" size="sm">
											<TrashIcon className="h-4 w-4" />
										</Button>
									</li>
								))}
							</ul>
							<div>
								<Popover>
									<PopoverTrigger asChild>
										<Button size="sm" variant="secondary" className="gap-2">
											<UploadIcon className="w-4 h-4" />
											<p>Add Content</p>
										</Button>
									</PopoverTrigger>
									<PopoverContent className="p-0 w-[200px]" align="end">
										<Command>
											<CommandList>
												<CommandGroup>
													<CommandItem>
														<form>
															<label className="flex items-center gap-2">
																<input
																	type="file"
																	name="file"
																	className="hidden"
																/>
																<HardDriveUploadIcon className="w-4 h-4" />
																<p>Upload from device</p>
															</label>
														</form>
													</CommandItem>
													<CommandItem>
														<button
															type="button"
															className="flex items-center gap-2"
														>
															<TextIcon className="w-4 h-4" />
															<p>Add text conent</p>
														</button>
													</CommandItem>
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>

			<Card>
				<CardHeader>
					<CardTitle>Add Knowledge</CardTitle>
					<CardDescription>
						Create a new knowledge to categorize related information.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="flex items-center gap-4"
						onSubmit={(e) => {
							e.preventDefault();
							const formData = new FormData(e.currentTarget);
							const name = formData.get("name");
							e.currentTarget.reset();
							invariant(typeof name === "string", "Name must be a string");
							mutate({
								type: "addKnowledge",
								optimisticData: {
									blueprintId: blueprint.id,
									knowledge: {
										isCreating: true,
										id: createTemporaryId(),
										name,
										files: [],
									},
								},
								action: (optimisticData) => createKnowledge(optimisticData),
							});
						}}
					>
						<Input name="name" data-1p-ignore />
						<Button size="sm" type="submit">
							Add
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
