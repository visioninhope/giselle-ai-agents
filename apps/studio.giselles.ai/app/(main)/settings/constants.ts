export const IMAGE_CONSTRAINTS = {
	maxSize: 1 * 1024 * 1024, // 1MB (Server Actions body size limit)
	formats: ["image/jpeg", "image/png", "image/gif", "image/webp"],
	mimeToExt: {
		"image/jpeg": "jpg",
		"image/png": "png",
		"image/gif": "gif",
		"image/webp": "webp",
	},
};
