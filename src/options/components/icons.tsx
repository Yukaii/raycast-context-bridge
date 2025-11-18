import type { SVGAttributes } from "react"

type IconProps = SVGAttributes<SVGSVGElement>

const baseIconProps: IconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 16 16"
}

const ChevronPath = {
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.5
}

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...baseIconProps} {...props}>
    <path {...ChevronPath} d="M12.25 5.75 8 10.25 3.75 5.75" />
  </svg>
)

export const ChevronUpIcon = (props: IconProps) => (
  <svg {...baseIconProps} {...props}>
    <path {...ChevronPath} d="M3.75 10.25 8 5.75l4.25 4.5" />
  </svg>
)

export const CheckIcon = (props: IconProps) => (
  <svg {...baseIconProps} {...props}>
    <path
      {...ChevronPath}
      d="m4 8 2.5 4c1-3.5 3-5.5 5.5-8"
    />
  </svg>
)

