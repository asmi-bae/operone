"use client"

import * as React from "react"
import { LoadingBar } from "@/components/ui/loading-bar"

interface LoadingContextType {
  startLoading: () => void
  stopLoading: () => void
  setProgress: (progress: number) => void
  isLoading: boolean
}

const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = React.useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

interface LoadingProviderProps {
  children: React.ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [progress, setProgress] = React.useState<number | undefined>(undefined)

  const startLoading = React.useCallback(() => {
    setIsLoading(true)
    setProgress(undefined)
  }, [])

  const stopLoading = React.useCallback(() => {
    setIsLoading(false)
  }, [])

  const setProgressValue = React.useCallback((value: number) => {
    setProgress(value)
  }, [])

  return (
    <LoadingContext.Provider
      value={{
        startLoading,
        stopLoading,
        setProgress: setProgressValue,
        isLoading,
      }}
    >
      <LoadingBar isLoading={isLoading} progress={progress} />
      {children}
    </LoadingContext.Provider>
  )
}
