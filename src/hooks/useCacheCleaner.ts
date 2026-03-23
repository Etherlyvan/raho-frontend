"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback }    from "react";
import { clearAllClientStorage } from "@/lib/utils";

export function useCacheCleaner() {
  const queryClient = useQueryClient();

  const clearAll = useCallback(() => {
    queryClient.clear();
    clearAllClientStorage();
  }, [queryClient]);

  const clearAuth = useCallback(() => {
    queryClient.removeQueries({ queryKey: ["auth"] });
    queryClient.removeQueries({ queryKey: ["profile"] });
  }, [queryClient]);

  const clearModule = useCallback(
    (key: string) => queryClient.removeQueries({ queryKey: [key] }),
    [queryClient],
  );

  return { clearAll, clearAuth, clearModule };
}
