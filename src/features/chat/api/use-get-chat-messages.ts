import { useInfiniteQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/src/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.chat.messages)["$get"], 200>;

type DataType = ResponseType["data"];

type Page = {
  documents: DataType["documents"];
  total: DataType["total"];
  nextCursor: DataType["nextCursor"];
};

interface UseGetChatMessagesProps {
  workspaceId: string;
  projectId?: string | null;
  limit?: number;
}

export const useGetChatMessages = ({
  workspaceId,
  projectId,
  limit,
}: UseGetChatMessagesProps) => {
  return useInfiniteQuery<Page>({
    queryKey: ["chat", "messages", workspaceId, projectId, limit],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const response = await client.api.chat.messages.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          cursor: (pageParam as string | null) ?? undefined,
          limit: limit ? limit.toString() : undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const { data } = await response.json();
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
};
