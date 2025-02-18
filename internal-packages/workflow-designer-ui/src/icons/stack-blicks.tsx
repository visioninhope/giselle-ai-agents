import clsx from "clsx/lite";
import type { FC, SVGProps } from "react";

export const StackBlicksIcon: FC<SVGProps<SVGSVGElement>> = ({
	className,
	...props
}) => (
	<svg
		width="32"
		height="33"
		viewBox="0 0 32 33"
		xmlns="http://www.w3.org/2000/svg"
		className={clsx("fill-current", className)}
		{...props}
	>
		<title>Stack Blicks Icon</title>
		<g clipPath="url(#clip0_9863_27541)">
			<path d="M6.95719 4.15893L2.24925 8.86687C1.27492 9.8412 1.27492 11.4209 2.24925 12.3952L6.95719 17.1032C7.93151 18.0775 9.51121 18.0775 10.4855 17.1032L15.1935 12.3952C16.1678 11.4209 16.1678 9.8412 15.1935 8.86687L10.4855 4.15893C9.51121 3.18461 7.93151 3.18461 6.95719 4.15893Z" />
			<path d="M26.1332 18.0111C30.0606 17.3736 32.7276 13.673 32.0901 9.74565C31.4526 5.81825 27.752 3.15127 23.8246 3.78878C19.8972 4.42628 17.2302 8.12687 17.8677 12.0543C18.5052 15.9817 22.2058 18.6486 26.1332 18.0111Z" />
			<path d="M26.4636 19.4091H6.99092C3.93638 19.4091 1.45456 22.0172 1.45456 25.2273C1.45456 28.4373 3.93638 31.0455 6.99092 31.0455H26.4636C29.5182 31.0455 32 28.4373 32 25.2273C32 22.0172 29.5182 19.4091 26.4636 19.4091Z" />
		</g>
		<defs>
			<clipPath id="clip0_9863_27541">
				<rect width="32" height="32" transform="translate(0 0.5)" />
			</clipPath>
		</defs>
	</svg>
);
