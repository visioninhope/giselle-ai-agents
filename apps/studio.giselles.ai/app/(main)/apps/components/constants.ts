export const LIGHT_TRACKING = {
	radius: 400,
	fadeInDuration: 80,
	fadeOutDuration: 300,
	trackingDuration: 120,
} as const;

export const BACKDROP_STYLES = {
	filter: "grayscale(1) brightness(0.78)",
	background: "rgba(0,0,0,0.001)",
	transform: "translateZ(0)",
} as const;

export const MASK_GRADIENTS = {
	dark: "radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)",
	light:
		"radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)",
} as const;

export const EASING = {
	smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const CSS_VARS = {
	x: "--x",
	y: "--y",
	radius: "--r",
} as const;

const _Z_INDEX = {
	darkLayer: 30,
	lightLayer: 40,
} as const;
