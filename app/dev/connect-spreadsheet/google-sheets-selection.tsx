"use client";

import React, { useState } from "react";

const drives = [
	{ id: "1", name: "My Drive" },
	{ id: "2", name: "Shared Drive" },
	{ id: "3", name: "Team Drive" },
];

const sheets = [
	{ id: "1", name: "Budget 2024" },
	{ id: "2", name: "Project Tracker" },
	{ id: "3", name: "Employee Records" },
];

const worksheets = [
	{ id: "1", name: "January" },
	{ id: "2", name: "February" },
	{ id: "3", name: "March" },
];

export function GoogleSheetsSelection() {
	const [selectedDrive, setSelectedDrive] = useState("");
	const [selectedSheet, setSelectedSheet] = useState("");
	const [selectedWorksheet, setSelectedWorksheet] = useState("");

	const handleDriveChange = (e) => {
		setSelectedDrive(e.target.value);
		setSelectedSheet("");
		setSelectedWorksheet("");
	};

	const handleSheetChange = (e) => {
		setSelectedSheet(e.target.value);
		setSelectedWorksheet("");
	};

	return (
		<div className="p-4 space-y-4">
			<div>
				<label
					htmlFor="drive-select"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Select a Drive
				</label>
				<select
					id="drive-select"
					value={selectedDrive}
					onChange={handleDriveChange}
					className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
				>
					<option value="">Choose a drive</option>
					{drives.map((drive) => (
						<option key={drive.id} value={drive.id}>
							{drive.name}
						</option>
					))}
				</select>
			</div>

			{selectedDrive && (
				<div>
					<label
						htmlFor="sheet-select"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Select a Sheet
					</label>
					<select
						id="sheet-select"
						value={selectedSheet}
						onChange={handleSheetChange}
						className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
					>
						<option value="">Choose a sheet</option>
						{sheets.map((sheet) => (
							<option key={sheet.id} value={sheet.id}>
								{sheet.name}
							</option>
						))}
					</select>
				</div>
			)}

			{selectedSheet && (
				<div>
					<label
						htmlFor="worksheet-select"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Select a Worksheet
					</label>
					<select
						id="worksheet-select"
						value={selectedWorksheet}
						onChange={(e) => setSelectedWorksheet(e.target.value)}
						className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
					>
						<option value="">Choose a worksheet</option>
						{worksheets.map((worksheet) => (
							<option key={worksheet.id} value={worksheet.id}>
								{worksheet.name}
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	);
}
