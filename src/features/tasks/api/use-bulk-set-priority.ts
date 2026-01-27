"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

import { client } from "@/src/lib/rpc";
import type { TaskPriority } from "../utils/task-flags";

type UpdateTaskJson =
  InferRequestType<(typeof client.api.tasks)[":taskId"]["$patch"]>["json"];

interface BulkPriorityUpdate {
  taskId: string;
  priority: TaskPriority;
}

interface BulkSetPriorityInput {
  updates: BulkPriorityUpdate[];
}

interface BulkSetPriorityResult {
  successCount: number;
  failureCount: number;
}

export const useBulkSetPriority = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkSetPriorityResult, Error, BulkSetPriorityInput>({
    mutationFn: async ({ updates }) => {
      const results = await Promise.allSettled(
        updates.map(async ({ taskId, priority }) => {
          const payload: UpdateTaskJson = { priority };
          const response = await client.api.tasks[":taskId"]["$patch"]({
            param: { taskId },
            json: payload,
          });
          return response;
        })
      );

      let successCount = 0;
      let failureCount = 0;

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.ok) {
          successCount += 1;
        } else {
          failureCount += 1;
        }
      }

      return { successCount, failureCount };
    },
    onSuccess: ({ successCount, failureCount }) => {
      if (successCount > 0) {
        toast.success(`${successCount} prioridade(s) aplicada(s)`);
      }
      if (failureCount > 0) {
        toast.error(`${failureCount} falharam ao aplicar prioridade`);
      }
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Falha ao aplicar prioridades");
    },
  });
};
