"use client";

import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";

import { DropdownMenuItem } from "@/src/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";

interface NotificationsMenuItemsProps {
  workspaceId?: string;
  chatUnreadCount: number;
  systemUnreadCount: number;
}

const formatCount = (count: number) => (count > 99 ? "99+" : String(count));

export const NotificationsMenuItems = ({
  workspaceId,
  chatUnreadCount,
  systemUnreadCount,
}: NotificationsMenuItemsProps) => {
  const chatCountLabel = chatUnreadCount > 0 ? formatCount(chatUnreadCount) : null;
  const systemCountLabel =
    systemUnreadCount > 0 ? formatCount(systemUnreadCount) : null;

  return (
    <>
      {workspaceId ? (
        <DropdownMenuItem asChild className="h-11 cursor-pointer">
          <Link
            href={`/workspaces/${workspaceId}/chat`}
            className="flex w-full items-center gap-2"
          >
            <MessageSquare className="size-4" />
            <span>Chat</span>
            <span
              className={cn(
                "ml-auto text-xs font-semibold text-muted-foreground",
                chatCountLabel && "text-rose-600"
              )}
            >
              {chatCountLabel ?? "0"}
            </span>
          </Link>
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuItem asChild className="h-11 cursor-pointer">
        <Link href="/notifications" className="flex w-full items-center gap-2">
          <Bell className="size-4" />
          <span>Notificacoes</span>
          <span
            className={cn(
              "ml-auto text-xs font-semibold text-muted-foreground",
              systemCountLabel && "text-rose-600"
            )}
          >
            {systemCountLabel ?? "0"}
          </span>
        </Link>
      </DropdownMenuItem>
    </>
  );
};
