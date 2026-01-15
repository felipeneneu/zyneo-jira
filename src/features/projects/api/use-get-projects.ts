import { useQuery } from "@tanstack/react-query";

import { client } from "@/src/lib/rpc";

interface useGetProjectsProps {
  workspaceId: string;
  enabled?: boolean;
}

export const useGetProjects = ({ workspaceId, enabled = true }: useGetProjectsProps) => {
  const query = useQuery({
    queryKey: ["projects", workspaceId],
    enabled,
    queryFn: async () => {
      const response = await client.api.projects.$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const { data } = await response.json();

      return data;
    },
  });
  return query;
};
