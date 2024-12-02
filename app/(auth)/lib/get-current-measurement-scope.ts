import { getCurrentTeam } from "./get-current-team";

/**
 * Get the current measurement scope.
 *
 * @returns The current measurement scope.
 */
export async function getCurrentMeasurementScope() {
	const currentTeam = await getCurrentTeam();
	return currentTeam.dbId;
}
