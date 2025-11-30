"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingBarProps {
  isLoading?: boolean
  progress?: number
  className?: string
}

const LoadingBar = React.forwardRef<HTMLDivElement, LoadingBarProps>(
  ({ className, isLoading = false, progress, ...props }, ref) => {
    const [internalProgress, setInternalProgress] = React.useState(0)
    const [isAnimating, setIsAnimating] = React.useState(false)

    React.useEffect(() => {
      if (isLoading) {
        setIsAnimating(true)
        setInternalProgress(0)
        
        // Simulate loading progress
        const timer1 = setTimeout(() => setInternalProgress(30), 100)
        const timer2 = setTimeout(() => setInternalProgress(60), 300)
        const timer3 = setTimeout(() => setInternalProgress(90), 600)
        
        return () => {
          clearTimeout(timer1)
          clearTimeout(timer2)
          clearTimeout(timer3)
        }
      } else {
        // Complete the progress when loading finishes
        if (isAnimating) {
          setInternalProgress(100)
          const timer = setTimeout(() => {
            setIsAnimating(false)
            setInternalProgress(0)
          }, 300)
          return () => clearTimeout(timer)
        }
      }
    }, [isLoading, isAnimating])

    // Use external progress if provided
    const displayProgress = progress !== undefined ? progress : internalProgress

    if (!isAnimating && progress === undefined) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-transparent",
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out relative overflow-hidden"
          style={{ 
            width: `${displayProgress}%`,
            transition: displayProgress === 100 ? 'width 0.3s ease-out' : 'width 0.2s ease-out'
          }}
        >
          {/* Subtle shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    )
  }
)
LoadingBar.displayName = "LoadingBar"

export { LoadingBar }
