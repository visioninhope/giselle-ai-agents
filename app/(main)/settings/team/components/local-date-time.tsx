"use client";

import { useEffect, useState } from "react";

interface LocalDateTimeProps {
	utcDateTime: Date;
	// Optional format configuration
	format?: Intl.DateTimeFormatOptions;
}

export function LocalDateTime({
	utcDateTime,
	format = {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	},
}: LocalDateTimeProps) {
	// Server-side rendering will display "Loading..." until the useEffect hook runs
	const [formattedDate, setFormattedDate] = useState("Loading...");

	useEffect(() => {
		// Display using browser's locale and timezone
		setFormattedDate(utcDateTime.toLocaleString(undefined, format));
	}, [utcDateTime, format]);

	return <time dateTime={utcDateTime.toISOString()}>{formattedDate}</time>;
}
