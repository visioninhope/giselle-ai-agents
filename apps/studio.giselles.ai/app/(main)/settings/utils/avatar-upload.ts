import { publicStorage } from "@/app/giselle-engine";
import { logger } from "@/lib/logger";
import { IMAGE_CONSTRAINTS } from "../constants";

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
	return (
		IMAGE_CONSTRAINTS.mimeToExt[
			mimeType as keyof typeof IMAGE_CONSTRAINTS.mimeToExt
		] || "jpg"
	);
}

/**
 * Validate image file MIME type and size
 */
export function validateImageFile(file: File): {
	valid: boolean;
	error?: string;
} {
	// Validate MIME type
	if (!IMAGE_CONSTRAINTS.formats.includes(file.type)) {
		return {
			valid: false,
			error:
				"Invalid file format. Please upload a JPG, PNG, GIF, or WebP image.",
		};
	}

	// Validate file size
	if (file.size > IMAGE_CONSTRAINTS.maxSize) {
		return {
			valid: false,
			error: `File size exceeds ${IMAGE_CONSTRAINTS.maxSize / (1024 * 1024)}MB limit`,
		};
	}

	return {
		valid: true,
	};
}

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(
	file: File,
	filePath: string,
): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	await publicStorage.setItemRaw(filePath, buffer, {
		contentType: file.type,
	});

	const avatarUrl = await publicStorage.getItem(filePath, {
		publicURL: true,
	});

	if (typeof avatarUrl !== "string") {
		throw new Error("Failed to get avatar URL");
	}

	return avatarUrl;
}

/**
 * Delete old avatar file from storage
 */
export async function deleteOldAvatar(
	currentAvatarUrl: string | null | undefined,
	newFilePath: string,
): Promise<void> {
	if (!currentAvatarUrl || currentAvatarUrl === newFilePath) {
		return;
	}

	try {
		// Extract file path from URL
		// From: https://xxx.supabase.co/storage/v1/object/public/public-assets/avatars/user-id.jpg
		// To: avatars/user-id.jpg
		const oldPath = currentAvatarUrl.split("/public-assets/")[1];

		if (oldPath) {
			await publicStorage.removeItem(oldPath);
			logger.debug("Old avatar file removed:", oldPath);
		}
	} catch (error) {
		// Don't fail the update if cleanup fails
		logger.error("Failed to remove old avatar:", error);
	}
}
