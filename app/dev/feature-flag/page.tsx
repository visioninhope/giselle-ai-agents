import { uploadFileToPromptNodeFlag as getUploadFileToPromptNodeFlag } from "@/flags";

export default async function () {
	const uploadFileToPromptNodeFlag = await getUploadFileToPromptNodeFlag();
	console.log(uploadFileToPromptNodeFlag);
	return (
		<div>
			uploadFileToPromptNodeFlag:{" "}
			{uploadFileToPromptNodeFlag ? "true" : "false"}
		</div>
	);
}
