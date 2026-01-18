import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/src/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.chat.unread)["$get"],
  200
>;

type DataType = ResponseType["data"];

interface UseChatUnreadOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useChatUnread = (
  workspaceId?: string,
  options: UseChatUnreadOptions = {}
) => {
  const { enabled = !!workspaceId, refetchInterval } = options;
  return useQuery<DataType>({
    queryKey: ["chat", "unread", workspaceId],
    enabled,
    refetchInterval,
    queryFn: async () => {
      if (!workspaceId) {
        return { unread: false, count: 0, lastMessageAt: null };
      }

      const response = await client.api.chat.unread.$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        return { unread: false, count: 0, lastMessageAt: null };
      }

      const { data } = await response.json();
      return data;
    },
  });
};
