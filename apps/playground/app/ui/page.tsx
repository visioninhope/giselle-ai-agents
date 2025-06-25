"use client";

import { Button } from "@giselle-internal/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from "@giselle-internal/ui/dialog";
import { useState } from "react";

const components = [
	{
		id: "button",
		name: "Button",
		component: (
			<div className="space-y-8">
				<div>
					<p className="text-text mb-2 text-sm">Style</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Button>Subtle(default)</Button>
							<Button variant="filled">Filled</Button>
							<Button variant="solid">Solid</Button>
							<Button variant="glass">glass</Button>
						</div>
					</div>
				</div>
				<div>
					<p className="text-text mb-2 text-sm">Size</p>
					<div className="bg-transparent p-8 rounded-[4px] border border-border shadow-sm text-sans">
						<div className="space-y-4">
							<Button variant="glass">default</Button>
							<Button variant="glass" size="large">
								Large
							</Button>
						</div>
					</div>
				</div>
			</div>
		),
	},
	{
		id: "dialog",
		name: "Dialog",
		component: (
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
											<Button type="button">Create</Button>
										</DialogFooter>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</div>
			</div>
		),
	},
] as const;

export default function () {
	return <p>Home</p>;
}
