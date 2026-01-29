import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/src/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["bulk-delete"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["bulk-delete"]["$post"]
>;

export const useBulkDeleteTasks = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType["data"], Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks["bulk-delete"]["$post"]({
        json,
      });
      if (!response.ok) {
        throw new Error("Failed to delete tasks");
      }
      const payload = await response.json();
      return payload.data;
    },
    onSuccess: ({ successCount, failureCount }) => {
      if (successCount > 0) {
        toast.success(`${successCount} tarefa(s) excluída(s)`);
      }
      if (failureCount > 0) {
        toast.error(`${failureCount} tarefa(s) não puderam ser excluídas`);
      }
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Falha ao excluir tarefas");
    },
  });
};
