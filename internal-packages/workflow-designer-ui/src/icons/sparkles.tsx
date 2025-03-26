import type { FC, SVGProps } from "react";

export const SparklesIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		className="fill-current"
		{...props}
	>
		<path d="M19,20.8L21.2,18.6L16.2,13.6L14,15.8L19,20.8M18.6,2.8L17.4,4L16.2,2.8L14,5L15.2,6.2L14,7.4L18.6,12L19.8,10.8L21,12L23.2,9.8L22,8.6L23.2,7.4L18.6,2.8M2.8,16.2L4,17.4L2.8,18.6L5,20.8L6.2,19.6L7.4,20.8L12,16.2L10.8,15L12,13.8L9.8,11.6L8.6,12.8L7.4,11.6L2.8,16.2M7.4,2.8L2.8,7.4L4,8.6L2.8,9.8L5,12L6.2,10.8L7.4,12L12,7.4L10.8,6.2L12,5L9.8,2.8L8.6,4L7.4,2.8Z" />
	</svg>
);
