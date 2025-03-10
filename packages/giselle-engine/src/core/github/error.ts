export class GithubError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "GithubError";
	}
}

export class NotFoundError extends GithubError {
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}

export class UnsupportedError extends GithubError {
	constructor(message: string) {
		super(message);
		this.name = "UnsupportedError";
	}
}
