"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/src/lib/rpc";
type ResponseType = InferResponseType<
  (typeof client.api.notifications)["daily-focus"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.notifications)["daily-focus"]["$post"]
>;

interface RegenerateDailyFocusInput {
  workspaceId: string;
}

export const useRegenerateDailyFocus = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RegenerateDailyFocusInput>({
    mutationFn: async ({ workspaceId }) => {
      const response = await client.api.notifications["daily-focus"].$post({
        json: { workspaceId, force: true } as RequestType["json"],
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate daily focus");
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      const dateKey = new Date().toISOString().slice(0, 10);
      queryClient.invalidateQueries({
        queryKey: ["daily-focus", variables.workspaceId, dateKey],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
