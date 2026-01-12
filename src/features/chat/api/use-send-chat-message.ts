import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/src/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.chat.messages)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.chat.messages)["$post"]>;

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.chat.messages.$post({ json });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return await response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", variables.json.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chat", "unread", variables.json.workspaceId],
      });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });
};
