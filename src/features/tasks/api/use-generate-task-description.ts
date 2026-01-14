import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/src/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[":taskId"]["ai-description"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["ai-description"]["$post"]
>;

export const useGenerateTaskDescription = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[":taskId"]["ai-description"][
        "$post"
      ]({ param });
      if (!response.ok) {
        throw new Error("Failed to generate");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });
  return mutation;
};
