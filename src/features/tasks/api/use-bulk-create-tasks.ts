"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

import { client } from "@/src/lib/rpc";

type CreateTaskJson = InferRequestType<(typeof client.api.tasks)["$post"]>["json"];

interface BulkCreateTasksInput {
  tasks: CreateTaskJson[];
}

interface BulkCreateTasksResult {
  successCount: number;
  failureCount: number;
}

export const useBulkCreateTasks = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkCreateTasksResult, Error, BulkCreateTasksInput>({
    mutationFn: async ({ tasks }) => {
      const results = await Promise.allSettled(
        tasks.map(async (task) => {
          const response = await client.api.tasks["$post"]({ json: task });
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
        toast.success(`${successCount} tarefa(s) criada(s)`);
      }
      if (failureCount > 0) {
        toast.error(`${failureCount} tarefa(s) falharam ao criar`);
      }
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Falha ao criar tarefas");
    },
  });
};
