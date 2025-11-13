// app/ReactQueryProvider.tsx
"use client";

import { ReactNode } from "react";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { isServer, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  // Create persister only on client side
  const persister = isServer
    ? undefined
    : createAsyncStoragePersister({ storage: window.localStorage });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: persister!, maxAge: Infinity }}
    >
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </PersistQueryClientProvider>
  );
}
