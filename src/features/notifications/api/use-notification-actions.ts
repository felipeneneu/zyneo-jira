"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/src/lib/rpc";

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await client.api.notifications[":notificationId"].read.$post({
        param: { notificationId },
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["daily-focus"] });
    },
  });

  return mutation;
};

export const useToggleNotificationStar = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await client.api.notifications[":notificationId"].star.$post({
        param: { notificationId },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle notification star");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return mutation;
};

export const useArchiveNotification = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await client.api.notifications[":notificationId"].archive.$post({
        param: { notificationId },
      });

      if (!response.ok) {
        throw new Error("Failed to archive notification");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return mutation;
};

export const useRemoveNotification = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await client.api.notifications[":notificationId"].remove.$post({
        param: { notificationId },
      });

      if (!response.ok) {
        throw new Error("Failed to remove notification");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return mutation;
};
