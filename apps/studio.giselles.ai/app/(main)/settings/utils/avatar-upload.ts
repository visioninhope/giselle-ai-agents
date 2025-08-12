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
 * Validate image file including MIME type, size, and magic bytes
 */
export async function validateImageFile(file: File): Promise<{
	valid: boolean;
	error?: string;
	actualType?: string;
}> {
	// Validate MIME type
	if (!IMAGE_CONSTRAINTS.formats.includes(file.type)) {
		return {
			valid: false,
			error: "Invalid file format. Please upload a JPG, PNG, GIF, or WebP image.",
		};
	}

	// Validate file size
	if (file.size > IMAGE_CONSTRAINTS.maxSize) {
		return {
			valid: false,
			error: `File size exceeds ${IMAGE_CONSTRAINTS.maxSize / (1024 * 1024)}MB limit`,
		};
	}

	// Server-side MIME type validation using file buffer
	const buffer = await file.arrayBuffer();
	const bytes = new Uint8Array(buffer);

	// Check magic bytes for actual file type
	let actualType: string | null = null;
	if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		actualType = "image/jpeg";
	} else if (
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47
	) {
		actualType = "image/png";
	} else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
		actualType = "image/gif";
	} else if (
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		actualType = "image/webp";
	}

	if (!actualType || !IMAGE_CONSTRAINTS.formats.includes(actualType)) {
		return {
			valid: false,
			error: "File content does not match allowed image types.",
		};
	}

	return {
		valid: true,
		actualType,
	};
}

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(
	file: File,
	filePath: string,
	actualType: string,
): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	await publicStorage.setItemRaw(filePath, buffer, {
		contentType: actualType,
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