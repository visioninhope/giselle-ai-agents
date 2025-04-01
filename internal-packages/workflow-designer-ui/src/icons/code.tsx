import type { FC, SVGProps } from "react";

export const CodeIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="26"
    height="25"
    viewBox="0 0 26 25"
    xmlns="http://www.w3.org/2000/svg"
    className="fill-current"
    role="img"
    aria-label="Code"
    {...props}
  >
    <path 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.2" 
      d="M9 2C5 2 3 5 3 8v9c0 3 2 6 6 6" 
    />
    <path 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.2" 
      d="M17 2c4 0 6 3 6 6v9c0 3-2 6-6 6" 
    />
    <path 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      d="M10 10h6" 
    />
    <path 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      d="M10 15h6" 
    />
  </svg>
); 