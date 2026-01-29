"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useGetNotifications } from "@/src/features/notifications/api/use-get-notifications";
import type { Notification } from "@/src/features/notifications/types";

const MAX_TOASTS = 3;

const getNotificationDescription = (notification: Notification) => {
  if (!notification.snippet) return "";

  try {
    const parsed = JSON.parse(notification.snippet) as { summary?: string };
    if (parsed && typeof parsed.summary === "string") {
      return parsed.summary;
    }
  } catch {
    // Keep raw snippet when it's not JSON.
  }

  return notification.snippet;
};

export const NotificationsRealtimeNotifier = () => {
  const queryClient = useQueryClient();
  const { data } = useGetNotifications({
    filter: "unread",
    refetchInterval: 5000,
  });
  const lastCreatedAtRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const notifications = data?.documents ?? [];
    if (notifications.length === 0) return;

    const newestCreatedAt = notifications[0].$createdAt;

    if (!hydratedRef.current) {
      hydratedRef.current = true;
      lastCreatedAtRef.current = newestCreatedAt;
      return;
    }

    const lastCreatedAt = lastCreatedAtRef.current;
    if (!lastCreatedAt) {
      lastCreatedAtRef.current = newestCreatedAt;
      return;
    }

    const newNotifications = notifications.filter(
      (notification) => notification.$createdAt > lastCreatedAt
    );

    if (newNotifications.length === 0) return;

    lastCreatedAtRef.current = newestCreatedAt;

    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "infinite"] });

    newNotifications
      .slice(0, MAX_TOASTS)
      .reverse()
      .forEach((notification) => {
        const description = getNotificationDescription(notification);
        toast(notification.title || "Nova notificacao", {
          description,
          duration: 8000,
        });
      });
  }, [data?.documents]);

  return null;
};
