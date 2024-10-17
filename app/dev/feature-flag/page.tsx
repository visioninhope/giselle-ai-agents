import { uploadFileToPromptNodeFlag as getUploadFileToPromptNodeFlag } from "@/flags";

export default async function () {
	const uploadFileToPromptNodeFlag = await getUploadFileToPromptNodeFlag();
	return (
		<div>
			uploadFileToPromptNodeFlag:{" "}
			{uploadFileToPromptNodeFlag ? "true" : "false"}
		</div>
	);
}
