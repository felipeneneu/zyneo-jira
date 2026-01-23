"use client";

import { useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/src/lib/rpc";
import type { Notification } from "../types";

type ResponseType = InferResponseType<
  (typeof client.api.notifications)["daily-focus"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.notifications)["daily-focus"]["$post"]
>;

interface UseGetDailyFocusParams {
  workspaceId?: string;
  enabled?: boolean;
}

const getDateKey = () => new Date().toISOString().slice(0, 10);

export const useGetDailyFocus = ({
  workspaceId,
  enabled = true,
}: UseGetDailyFocusParams) => {
  const dateKey = getDateKey();

  return useQuery({
    queryKey: ["daily-focus", workspaceId, dateKey],
    enabled: enabled && !!workspaceId,
    queryFn: async () => {
      const response = await client.api.notifications["daily-focus"].$post({
        json: { workspaceId } as RequestType["json"],
      });

      if (!response.ok) {
        throw new Error("Failed to fetch daily focus");
      }

      const { data } = (await response.json()) as ResponseType;
      return data as { notification: Notification | null };
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};
