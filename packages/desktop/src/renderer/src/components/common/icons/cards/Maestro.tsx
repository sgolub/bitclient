import type { SVGProps } from 'react';

export default function Maestro(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props} xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <circle cx="7" cy="12" fill="#eb001b" r="7" />
        <circle cx="17" cy="12" fill="#00a1df" fillOpacity=".8" r="7" />
      </g>
    </svg>
  );
}
