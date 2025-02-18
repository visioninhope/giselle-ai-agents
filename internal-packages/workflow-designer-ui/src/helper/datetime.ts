/**
 * Returns relative time like "2 hours ago", "in 3 days", etc.
 * Supports both past and future dates
 */
export function toRelativeTime(timestamp: number): string {
	const now = Date.now();
	const diff = timestamp - now;
	const absMs = Math.abs(diff);
	const isPast = diff < 0;

	// Time units in milliseconds
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const week = 7 * day;
	const month = 30 * day;
	const year = 365 * day;

	// Helper function to format the time with proper pluralization
	const formatUnit = (value: number, unit: string): string => {
		const plural = value === 1 ? "" : "s";
		return isPast
			? `${value} ${unit}${plural} ago`
			: `in ${value} ${unit}${plural}`;
	};

	if (absMs < minute) {
		return isPast ? "just now" : "in a few seconds";
	}

	if (absMs < hour) {
		const mins = Math.floor(absMs / minute);
		return formatUnit(mins, "minute");
	}

	if (absMs < day) {
		const hrs = Math.floor(absMs / hour);
		return formatUnit(hrs, "hour");
	}

	if (absMs < week) {
		const days = Math.floor(absMs / day);
		return formatUnit(days, "day");
	}

	if (absMs < month) {
		const weeks = Math.floor(absMs / week);
		return formatUnit(weeks, "week");
	}

	if (absMs < year) {
		const months = Math.floor(absMs / month);
		return formatUnit(months, "month");
	}

	const years = Math.floor(absMs / year);
	return formatUnit(years, "year");
}
