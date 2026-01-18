"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/src/lib/rpc";
import type { CommentType } from "../types";
import { toast } from "sonner";

interface CreateCommentParams {
  taskId: string;
  type: CommentType;
  content: string;
}

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ taskId, type, content }: CreateCommentParams) => {
      const response = await client.api.comments.$post({
        json: { taskId, type, content },
      });

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      const { data } = await response.json();
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Comentário adicionado");
      queryClient.invalidateQueries({ queryKey: ["comments", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
    },
    onError: () => {
      toast.error("Erro ao adicionar comentário");
    },
  });

  return mutation;
};
