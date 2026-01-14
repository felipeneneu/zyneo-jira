import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/src/lib/rpc";

type ResponseType = InferResponseType<(typeof client.api.auth)["sync-profile"]["$post"], 200>;

export const useSyncProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, void>({
    mutationFn: async () => {
      const response = await client.api.auth["sync-profile"].$post();
      if (!response.ok) {
        throw new Error("Failed to sync profile");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
  });
};
