"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/src/lib/rpc";
import type { Notification } from "../types";

type NotificationFilter = "all" | "unread" | "starred";

interface UseInfiniteNotificationsParams {
  filter?: NotificationFilter;
  limit?: number;
}

export const useInfiniteNotifications = ({
  filter = "all",
  limit = 20,
}: UseInfiniteNotificationsParams = {}) =>
  useInfiniteQuery({
    queryKey: ["notifications", "infinite", filter, limit],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const query: Record<string, string> = {
        filter,
        limit: String(limit),
      };

      if (pageParam) {
        query.cursor = pageParam;
      }

      const response = await client.api.notifications.$get({
        query,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = (await response.json()).data as {
        documents: Notification[];
        total: number;
        nextCursor: string | null;
      };

      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
