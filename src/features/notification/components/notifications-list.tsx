"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Bell,
  Archive,
  Star,
  Trash2,
  Circle,
  AlertTriangle,
  Clock,
  AtSign,
  Sparkles,
  CheckCheck,
  Trash,
} from "lucide-react";
import { cn, formatDate } from "@/src/lib/utils";
import { NotificationModal } from "./notification-modal";
import { Input } from "@/src/ui/input";
import { Button } from "@/src/ui/button";
import { MembersAvatar } from "@/src/features/members/components/members-avatar";
import { useConfirm } from "@/src/hooks/use-confirm";
import { useInfiniteNotifications } from "@/src/features/notifications/api/use-infinite-notifications";
import { useGetNotifications } from "@/src/features/notifications/api/use-get-notifications";
import {
  useToggleNotificationStar,
  useArchiveNotification,
  useRemoveNotification,
  useMarkAllNotificationsRead,
  useRemoveAllNotifications,
} from "@/src/features/notifications/api/use-notification-actions";
import type { Notification } from "@/src/features/notifications/types";
import { ScrollArea, ScrollBar } from "@/src/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/ui/tabs";

type NotificationFilter = "all" | "unread" | "starred";

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "task.stale":
    case "system.stale":
      return <Clock className="size-4 text-amber-500" />;
    case "task.overdue":
    case "system.overdue":
      return <AlertTriangle className="size-4 text-red-500" />;
    case "task.blocked":
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
        styles[severity],
      )}
    >
      {labels[severity]}
    </span>
  );
};

export function NotificationsList() {
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [search, setSearch] = useState("");
  const toggleStar = useToggleNotificationStar();
  const archive = useArchiveNotification();
  const remove = useRemoveNotification();
  const markAllRead = useMarkAllNotificationsRead();
  const removeAll = useRemoveAllNotifications();
  const { data: unreadData } = useGetNotifications({ filter: "unread" });
  const unreadCount = unreadData?.total ?? 0;
  const [RemoveAllDialog, confirmRemoveAll] = useConfirm(
    "Remover todas as notificações",
    "Tem certeza que deseja remover todas as notificações? Essa ação não poderá ser desfeita.",
    "destructive"
  );

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleStar.mutate(id);
  };

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    archive.mutate(id);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    remove.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleRemoveAll = async () => {
    const ok = await confirmRemoveAll();
    if (!ok) return;
    removeAll.mutate();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <RemoveAllDialog />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-black">Notificações</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-medium text-white">
              {unreadCount} novas
            </span>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="gap-2"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending || unreadCount === 0}
            >
              <CheckCheck className="size-4" />
              Marcar todas como lidas
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-2"
              onClick={handleRemoveAll}
              disabled={removeAll.isPending}
            >
              <Trash className="size-4" />
              Remover todas
            </Button>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar notificações..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        className="flex flex-1 flex-col overflow-hidden min-h-0"
      >
        <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0 sm:w-auto">
            <TabsTrigger
              value="all"
              className="h-9 rounded-lg px-4 text-sm font-medium data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Todas
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="h-9 rounded-lg px-4 text-sm font-medium data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Não lidas
            </TabsTrigger>
            <TabsTrigger
              value="starred"
              className="h-9 rounded-lg px-4 text-sm font-medium data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Favoritas
            </TabsTrigger>
          </TabsList>
          <p className="text-xs text-gray-500">
            Notificações arquivadas serão removidas automaticamente após 30 dias.
          </p>
        </div>

        <TabsContent value="all" className="mt-0 flex-1 min-h-0">
          <NotificationsPanel
            filter="all"
            search={search}
            onOpen={handleNotificationClick}
            onArchive={handleArchive}
            onRemove={handleRemove}
            onToggleStar={handleToggleStar}
          />
        </TabsContent>
        <TabsContent value="unread" className="mt-0 flex-1 min-h-0">
          <NotificationsPanel
            filter="unread"
            search={search}
            onOpen={handleNotificationClick}
            onArchive={handleArchive}
            onRemove={handleRemove}
            onToggleStar={handleToggleStar}
          />
        </TabsContent>
        <TabsContent value="starred" className="mt-0 flex-1 min-h-0">
          <NotificationsPanel
            filter="starred"
            search={search}
            onOpen={handleNotificationClick}
            onArchive={handleArchive}
            onRemove={handleRemove}
            onToggleStar={handleToggleStar}
          />
        </TabsContent>
      </Tabs>

      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}

function NotificationsPanel({
  filter,
  search,
  onOpen,
  onArchive,
  onRemove,
  onToggleStar,
}: {
  filter: NotificationFilter;
  search: string;
  onOpen: (notification: Notification) => void;
  onArchive: (e: React.MouseEvent, id: string) => void;
  onRemove: (e: React.MouseEvent, id: string) => void;
  onToggleStar: (e: React.MouseEvent, id: string) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteNotifications({ filter, limit: 20 });

  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.documents) ?? [],
    [data?.pages]
  );

  const filteredNotifications = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return notifications;
    return notifications.filter((notification) => {
      const title = notification.title?.toLowerCase() ?? "";
      const snippet = notification.snippet?.toLowerCase() ?? "";
      return title.includes(normalized) || snippet.includes(normalized);
    });
  }, [notifications, search]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;
    const viewport =
      scrollContainerRef.current?.querySelector<HTMLElement>(
        '[data-slot="scroll-area-viewport"]'
      ) ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: viewport, rootMargin: "200px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <div className="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
        <p className="mt-4 text-sm">Carregando...</p>
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <Bell className="mb-4 h-12 w-12" />
        <p className="text-lg font-medium">Nenhuma notificação</p>
        <p className="text-sm">Você está em dia!</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-hidden bg-white flex flex-col">
      <div ref={scrollContainerRef} className="h-full min-h-0 flex-1">
        <ScrollArea className="h-full min-h-0">
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.$id}
                onClick={() => onOpen(notification)}
                className={cn(
                  "flex cursor-pointer items-start gap-4 px-4 py-4 transition-colors hover:bg-gray-50 sm:px-6",
                  !notification.readAt && "bg-blue-50/50",
                )}
              >
                <div className="flex h-full items-center pt-2">
                  <Circle
                    className={cn(
                      "h-2 w-2",
                      !notification.readAt
                        ? "fill-blue-500 text-blue-500"
                        : "fill-transparent text-transparent",
                    )}
                  />
                </div>

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

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "text-sm",
                          !notification.readAt
                            ? "font-semibold text-black"
                            : "font-medium text-gray-700",
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

                <div className="flex flex-shrink-0 items-center gap-1">
                  <Button
                    onClick={(e) => onToggleStar(e, notification.$id)}
                    className="rounded p-1.5 hover:bg-gray-100"
                    variant={"ghost"}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        notification.starredAt
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300",
                      )}
                    />
                  </Button>
                  <Button
                    onClick={(e) => onArchive(e, notification.$id)}
                    className="rounded p-1.5 hover:bg-gray-100"
                    title="Arquivar"
                    variant={"ghost"}
                  >
                    <Archive className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button
                    onClick={(e) => onRemove(e, notification.$id)}
                    className="rounded p-1.5 hover:bg-gray-100"
                    title="Excluir"
                    variant={"ghost"}
                  >
                    <Trash2 className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div ref={loadMoreRef} className="h-6" />
          {isFetchingNextPage ? (
            <div className="flex items-center justify-center py-4 text-xs text-gray-400">
              Carregando mais...
            </div>
          ) : null}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
