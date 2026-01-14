import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/src/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.chat)["mark-read"]["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.chat)["mark-read"]["$post"]>;

export const useMarkChatRead = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.chat["mark-read"].$post({ json });
      if (!response.ok) {
        throw new Error("Failed to mark read");
      }
      return await response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "unread", variables.json.workspaceId],
      });
    },
  });
};
