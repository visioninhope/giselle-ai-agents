/**
 * Convert a date to a relative time string
 * @param date - The date to convert
 * @returns A human-readable relative time string
 */
export function getRelativeTimeString(date: Date): string {
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInSeconds = Math.floor(diffInMs / 1000);
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	const diffInHours = Math.floor(diffInMinutes / 60);
	const diffInDays = Math.floor(diffInHours / 24);

	if (diffInDays > 7) {
		return date.toLocaleDateString("en-US");
	}
	if (diffInDays >= 1) {
		return diffInDays === 1 ? "yesterday" : `${diffInDays} days ago`;
	}
	if (diffInHours >= 1) {
		return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
	}
	if (diffInMinutes >= 1) {
		return diffInMinutes === 1
			? "1 minute ago"
			: `${diffInMinutes} minutes ago`;
	}
	return "just now";
}
