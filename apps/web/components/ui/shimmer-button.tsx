import React from "react"
import { cn } from "@/lib/utils"

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  shimmerColor?: string
  shimmerDuration?: string
  borderRadius?: string
  className?: string
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ children, className, shimmerColor = "#ffffff", shimmerDuration = "3s", borderRadius = "0.5rem", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute inset-0 inline-flex h-full w-full animate-shimmer items-center justify-center rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] bg-[length:200%_100%]",
            `bg-[${shimmerColor}]`
          )}
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}22, transparent)`,
            backgroundSize: "200% 100%",
            animation: `shimmer ${shimmerDuration} infinite`,
            borderRadius,
          }}
        />
        <span
          className={cn(
            "relative inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-2 text-sm font-medium text-white backdrop-blur-3xl transition duration-300 hover:bg-slate-900",
            className
          )}
        >
          {children}
        </span>
      </button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"

export default ShimmerButton
