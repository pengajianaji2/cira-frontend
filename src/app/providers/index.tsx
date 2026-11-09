"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { GlobalStateProvider } from "@/shared/components/state/GlobalStateProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 menit
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    // Remove the legacy persisted profile once; session state now comes from /auth/me.
    window.localStorage.removeItem("cira-auth-storage");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStateProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </GlobalStateProvider>
    </QueryClientProvider>
  );
}
