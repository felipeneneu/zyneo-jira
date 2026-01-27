"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Search,
  Bell,
  MoreHorizontal,
  Star,
  Circle,
  AlertTriangle,
  Clock,
  AtSign,
  Sparkles,
} from "lucide-react";
import { cn, formatDate } from "@/src/lib/utils";
import { NotificationModal } from "./notification-modal";
import { Input } from "@/src/ui/input";
import { Button } from "@/src/ui/button";
import { MembersAvatar } from "@/src/features/members/components/members-avatar";
import { useGetNotifications } from "@/src/features/notifications/api/use-get-notifications";
import {
  useToggleNotificationStar,
  useArchiveNotification,
  useRemoveNotification,
} from "@/src/features/notifications/api/use-notification-actions";
import type { Notification } from "@/src/features/notifications/types";

type NotificationFilter = "all" | "unread" | "starred";

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "system.stale":
      return <Clock className="size-4 text-amber-500" />;
    case "system.overdue":
      return <AlertTriangle className="size-4 text-red-500" />;
    case "system.daily_focus":
      return <Sparkles className="size-4 text-amber-500" />;
    case "human.mention":
      return <AtSign className="size-4 text-blue-500" />;
    default:
      return <Bell className="size-4 text-gray-500" />;
  }
};

const getSeverityBadge = (severity: Notification["severity"]) => {
  const styles = {
    info: "bg-blue-100 text-blue-700",
    warn: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-700",
  };

  const labels = {
    info: "Info",
    warn: "Atenção",
    critical: "Crítico",
  };

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        styles[severity]
      )}
    >
      {labels[severity]}
    </span>
  );
};

const REMOVE_ON_ARCHIVE_KEY = "notifications:remove-on-archive";

export function NotificationsList() {
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [removeOnArchive, setRemoveOnArchive] = useState(false);

  const { data, isLoading } = useGetNotifications({ filter });
  const toggleStar = useToggleNotificationStar();
  const archive = useArchiveNotification();
  const remove = useRemoveNotification();

  const notifications = data?.documents ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  useEffect(() => {
    const stored = localStorage.getItem(REMOVE_ON_ARCHIVE_KEY);
    if (stored === "true") {
      setRemoveOnArchive(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(REMOVE_ON_ARCHIVE_KEY, String(removeOnArchive));
  }, [removeOnArchive]);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleStar.mutate(id);
  };

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (removeOnArchive) {
      remove.mutate(id);
      return;
    }
    archive.mutate(id);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-black">Notificações</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-medium text-white">
              {unreadCount} novas
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar notificações..."
              className="h-9 w-64 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setFilter("all")}
            variant="ghost"
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              filter === "all"
                ? "bg-black text-white hover:bg-gray-800"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            Todas
          </Button>
          <Button
            onClick={() => setFilter("unread")}
            variant="ghost"
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              filter === "unread"
                ? "bg-black text-white hover:bg-gray-800"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            Não lidas
          </Button>
          <Button
            onClick={() => setFilter("starred")}
            variant="ghost"
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              filter === "starred"
                ? "bg-black text-white hover:bg-gray-800"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            Favoritas
          </Button>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          <input
            type="checkbox"
            className="size-4 rounded border-gray-300 text-black focus:ring-1 focus:ring-black"
            checked={removeOnArchive}
            onChange={(e) => setRemoveOnArchive(e.target.checked)}
          />
          Remover ao invés de arquivar
        </label>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-auto bg-white">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <div className="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
            <p className="mt-4 text-sm">Carregando...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <Bell className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">Nenhuma notificação</p>
            <p className="text-sm">Você está em dia!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.$id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "flex cursor-pointer items-start gap-4 px-6 py-4 transition-colors hover:bg-gray-50",
                  !notification.readAt && "bg-blue-50/50"
                )}
              >
                {/* Unread indicator */}
                <div className="flex h-full items-center pt-2">
                  <Circle
                    className={cn(
                      "h-2 w-2",
                      !notification.readAt
                        ? "fill-blue-500 text-blue-500"
                        : "fill-transparent text-transparent"
                    )}
                  />
                </div>

                {/* Icon / Avatar */}
                <div className="flex-shrink-0">
                  {notification.type === "human.mention" ? (
                    <MembersAvatar
                      name={notification.title.split(" ")[0] || "U"}
                      className="size-10"
                      fallbackClassName="text-sm"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm",
                          !notification.readAt
                            ? "font-semibold text-black"
                            : "font-medium text-gray-700"
                        )}
                      >
                        {notification.title}
                      </p>
                      {getSeverityBadge(notification.severity)}
                    </div>
                    <span className="flex-shrink-0 text-xs text-gray-400">
                      {formatDate(notification.$createdAt, "dd/MM HH:mm")}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {(() => {
                      try {
                        const parsed = JSON.parse(notification.snippet);
                        return parsed.summary || notification.snippet;
                      } catch {
                        return notification.snippet;
                      }
                    })()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={(e) => handleToggleStar(e, notification.$id)}
                    className="rounded p-1.5 hover:bg-gray-100"
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        notification.starredAt
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                  <button
                    onClick={(e) => handleArchive(e, notification.$id)}
                    className="rounded p-1.5 hover:bg-gray-100"
                    title={removeOnArchive ? "Remover" : "Arquivar"}
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}
