export type DocumentLoaderErrorCode =
	| "DOCUMENT_NOT_FOUND"
	| "DOCUMENT_FETCH_ERROR"
	| "DOCUMENT_RATE_LIMITED"
	| "DOCUMENT_TOO_LARGE";

export type Installation = {
	id: number;
	name: string;
};

export type Repository = {
	id: number;
	owner: string;
	name: string;
};

export type InstallationWithRepos = {
	installation: Installation;
	repositories: Repository[];
};

export type ActionResult =
	| { success: true }
	| { success: false; error: string };
