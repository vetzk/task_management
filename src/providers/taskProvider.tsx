"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function isHttpError(
    error: unknown
): error is { status: number; message?: string } {
    return (
        error !== null &&
        typeof error === "object" &&
        "status" in error &&
        typeof (error as { status: unknown }).status === "number"
    );
}

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: (failureCount, error) => {
                            if (
                                isHttpError(error) &&
                                error.status >= 400 &&
                                error.status < 500
                            ) {
                                return false;
                            }
                            return failureCount < 3;
                        },
                    },
                    mutations: {
                        retry: (failureCount, error) => {
                            // Don't retry client errors for mutations
                            if (
                                isHttpError(error) &&
                                error.status >= 400 &&
                                error.status < 500
                            ) {
                                return false;
                            }
                            return failureCount < 2;
                        },
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
