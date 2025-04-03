import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  path: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(path, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options?.headers || {}),
        Accept: 'application/json',
      },
    });

    await throwIfResNotOk(res);
    
    // Check if the response is empty (for example, a 204 No Content)
    const contentType = res.headers.get('content-type');
    if (
      !contentType || 
      !contentType.includes('application/json') || 
      res.status === 204
    ) {
      return null;
    }
    
    return await res.json() as T;
  } catch (error) {
    console.error(`API request error: ${error}`);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
