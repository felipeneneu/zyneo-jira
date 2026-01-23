import { useGetWorkspaces } from "@/src/features/workspaces/api/use-get-workspaces";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";

export const useResolvedWorkspaceId = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspaces } = useGetWorkspaces();
  const fallbackWorkspaceId = workspaces?.documents?.[0]?.$id;

  return workspaceId || fallbackWorkspaceId;
};
