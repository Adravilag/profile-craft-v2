// services/react-query/queryClient.ts

import { QueryClient, type DefaultOptions } from '@tanstack/react-query';

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
    retry: (failureCount, error: any) =>
      error?.status >= 400 && error?.status < 500 ? false : failureCount < 3,
  },
  mutations: { retry: 1, networkMode: 'online' },
};

export const queryClient = new QueryClient({ defaultOptions });
