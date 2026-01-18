"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/src/lib/rpc";
import type { TaskComment } from "../types";

interface UseGetCommentsParams {
  taskId: string;
}

export const useGetComments = ({ taskId }: UseGetCommentsParams) => {
  const query = useQuery({
    queryKey: ["comments", taskId],
    queryFn: async () => {
      const response = await client.api.comments.$get({
        query: { taskId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const { data } = await response.json();
      return data as {
        documents: TaskComment[];
        total: number;
      };
    },
    enabled: !!taskId,
  });

  return query;
};
