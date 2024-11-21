import pino from "pino";

const baseConfig = {
	level: process.env.LOGLEVEL || "info",
};

export const logger = (() => {
	if (process.env.NODE_ENV === "development") {
		// enable pretty logging only in development
		return pino({
			...baseConfig,
			transport: {
				target: "pino-pretty",
			},
		});
	}

	return pino(baseConfig);
})();
