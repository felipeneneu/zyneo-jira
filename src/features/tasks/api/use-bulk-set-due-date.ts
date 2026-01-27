"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

import { client } from "@/src/lib/rpc";

type UpdateTaskJson =
  InferRequestType<(typeof client.api.tasks)[":taskId"]["$patch"]>["json"];

interface BulkDueDateUpdate {
  taskId: string;
  dueDate: Date;
}

interface BulkSetDueDateInput {
  updates: BulkDueDateUpdate[];
}

interface BulkSetDueDateResult {
  successCount: number;
  failureCount: number;
}

export const useBulkSetDueDate = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkSetDueDateResult, Error, BulkSetDueDateInput>({
    mutationFn: async ({ updates }) => {
      const results = await Promise.allSettled(
        updates.map(async ({ taskId, dueDate }) => {
          const payload: UpdateTaskJson = { dueDate };
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
        toast.success(`${successCount} prazo(s) atualizado(s)`);
      }
      if (failureCount > 0) {
        toast.error(`${failureCount} falharam ao atualizar prazo`);
      }
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Falha ao atualizar prazos");
    },
  });
};
