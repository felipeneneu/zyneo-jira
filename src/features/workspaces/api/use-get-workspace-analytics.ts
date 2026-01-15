import { useQuery } from "@tanstack/react-query";

import { client } from "@/src/lib/rpc";
import { InferResponseType } from "hono";

interface useGetWorkspaceAnalyticsProps {
  workspaceId: string;
  enabled?: boolean;
}

export type WorkspaceAnalyticsResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["analytics"]["$get"],
  200
>;

export const useGetWorkspaceAnalytics = ({
  workspaceId,
  enabled = true,
}: useGetWorkspaceAnalyticsProps) => {
  const query = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    enabled,
    queryFn: async () => {
      const response = await client.api.workspaces[":workspaceId"][
        "analytics"
      ].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workspace analytics");
      }

      const { data } = await response.json();

      return data;
    },
  });
  return query;
};
