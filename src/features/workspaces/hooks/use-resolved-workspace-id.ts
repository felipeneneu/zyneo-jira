"use client";

import { useEffect, useState } from "react";
import { useGetWorkspaces } from "@/src/features/workspaces/api/use-get-workspaces";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";

const LAST_WORKSPACE_KEY = "workspace:last-selected";

export const useResolvedWorkspaceId = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspaces } = useGetWorkspaces();
  const fallbackWorkspaceId = workspaces?.documents?.[0]?.$id;
  const [lastWorkspaceId, setLastWorkspaceId] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (workspaceId) {
      localStorage.setItem(LAST_WORKSPACE_KEY, workspaceId);
      setLastWorkspaceId(workspaceId);
      return;
    }
    if (!lastWorkspaceId) {
      const stored = localStorage.getItem(LAST_WORKSPACE_KEY);
      if (stored) {
        setLastWorkspaceId(stored);
      }
    }
  }, [lastWorkspaceId, workspaceId]);

  return workspaceId || lastWorkspaceId || fallbackWorkspaceId;
};
