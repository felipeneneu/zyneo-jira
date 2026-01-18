import { useQuery } from "@tanstack/react-query";

import { client } from "@/src/lib/rpc";

interface useGetWorkspaceProps {
  workspaceId: string;
  enabled?: boolean;
}

export const useGetWorkspace = ({
  workspaceId,
  enabled = true,
}: useGetWorkspaceProps) => {
  const query = useQuery({
    queryKey: ["workspace", workspaceId],
    enabled,
    queryFn: async () => {
      const response = await client.api.workspaces[":workspaceId"].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workspace");
      }

      const { data } = await response.json();

      return data;
    },
  });
  return query;
};
