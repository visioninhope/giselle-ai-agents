import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	webpack: (config) => {
		config.module = {
			...config.module,
			exprContextCritical: false,
			rules: [
				...config.module.rules,
				{
					test: /\.node$/,
					use: "node-loader",
				},
			],
		};
		return config;
	},
};

export default nextConfig;
