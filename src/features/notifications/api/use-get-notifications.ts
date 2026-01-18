"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/src/lib/rpc";
import type { Notification } from "../types";

type NotificationFilter = "all" | "unread" | "starred";

interface UseGetNotificationsParams {
  filter?: NotificationFilter;
  enabled?: boolean;
}

export const useGetNotifications = ({
  filter = "all",
  enabled = true,
}: UseGetNotificationsParams = {}) => {
  const query = useQuery({
    queryKey: ["notifications", filter],
    enabled,
    queryFn: async () => {
      const response = await client.api.notifications.$get({
        query: { filter },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const { data } = await response.json();
      return data as {
        documents: Notification[];
        total: number;
      };
    },
  });

  return query;
};
