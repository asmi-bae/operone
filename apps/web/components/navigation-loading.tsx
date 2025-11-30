"use client"

import { useLoading } from "@/components/providers/loading-provider"
import { usePathname } from "next/navigation"
import { useEffect, Suspense } from "react"

function NavigationLoadingInner() {
  const { startLoading, stopLoading } = useLoading()
  const pathname = usePathname()

  useEffect(() => {
    // Start loading when route changes
    startLoading()

    // Stop loading after a short delay to simulate page load
    const timer = setTimeout(() => {
      stopLoading()
    }, 300)

    return () => {
      clearTimeout(timer)
      stopLoading()
    }
  }, [pathname, startLoading, stopLoading])

  // This component doesn't render anything visible
  // It just manages the loading state for navigation
  return null
}

export default function NavigationLoading() {
  return (
    <Suspense fallback={null}>
      <NavigationLoadingInner />
    </Suspense>
  )
}
