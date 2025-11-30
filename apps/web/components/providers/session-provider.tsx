"use client";

import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function SessionProviderWrapper({ children }: ProvidersProps) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch every 5 minutes
      refetchOnWindowFocus={false} // Disable automatic refetch on window focus
    >
      {children}
    </SessionProvider>
  );
}
