"use client"

import { useLoading } from "@/components/providers/loading-provider"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function useRouteLoading() {
  const { startLoading, stopLoading } = useLoading()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Start loading when route changes
    startLoading()

    // Stop loading after a short delay to simulate page load
    const timer = setTimeout(() => {
      stopLoading()
    }, 500)

    return () => {
      clearTimeout(timer)
      stopLoading()
    }
  }, [pathname, searchParams, startLoading, stopLoading])
}
