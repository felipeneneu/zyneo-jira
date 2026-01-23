"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/ui/dropdown-menu";

import { useLogout } from "../api/use-logout";
import { useCurrent } from "../api/use-current";
import { Loader, LogOut } from "lucide-react";
import { useResolvedWorkspaceId } from "@/src/features/workspaces/hooks/use-resolved-workspace-id";
import { useChatUnread } from "@/src/features/chat/api/use-chat-unread";
import { useSyncProfile } from "../api/use-sync-profile";
import { useEffect, useMemo, useRef } from "react";
import { useGetNotifications } from "@/src/features/notifications/api/use-get-notifications";
import { NotificationsMenuItems } from "@/src/features/notifications/components/notifications-menu-items";
import { DottedSeparator } from "@/src/ui/dotted-separator";

interface UserButtonProps {
  showNotificationsBadge?: boolean;
}

export const UserButton = ({
  showNotificationsBadge = false,
}: UserButtonProps) => {
  const { data: user, isLoading } = useCurrent();
  const { mutate: logout } = useLogout();

  const workspaceId = useResolvedWorkspaceId();
  const { data: unreadData } = useChatUnread(workspaceId);
  const { data: systemUnreadData } = useGetNotifications({
    filter: "unread",
    enabled: !!user,
  });
  const { mutate: syncProfile } = useSyncProfile();
  const didTrySync = useRef(false);
  const avatarUrl = useMemo(
    () => (user?.prefs as Record<string, string>)?.avatarUrl,
    [user]
  );

  useEffect(() => {
    if (!user) return;
    if (avatarUrl) return;
    if (didTrySync.current) return;
    didTrySync.current = true;
    syncProfile();
  }, [avatarUrl, syncProfile, user]);

  if (isLoading) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { name, email } = user;
  const avatarFallback = name
    ? name.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase() ?? "0";
  const unreadCount = (unreadData && "count" in unreadData ? unreadData.count : 0) ?? (unreadData?.unread ? 1 : 0);
  const systemUnreadCount = systemUnreadData?.total ?? 0;
  const totalUnreadCount = unreadCount + systemUnreadCount;
  const unreadLabel = totalUnreadCount > 99 ? "99+" : String(totalUnreadCount);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative cursor-pointer">
        {showNotificationsBadge && totalUnreadCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-red-500 ring-2 ring-white text-[10px] leading-4 font-semibold text-white flex items-center justify-center">
            {unreadLabel}
          </span>
        ) : null}
        <Avatar className="size-10 hover:opacity-75 transition border border-neutral-300">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name || email} />
          ) : null}
          <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-60"
        sideOffset={10}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <Avatar className="size-13 hover:opacity-75 transition border border-neutral-300">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={name || email} />
            ) : null}
            <AvatarFallback className="bg-neutral-200 text-xl font-medium text-neutral-500 flex items-center justify-center">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-neutral-900">
              {name || "User"}
            </p>
            <p className="text-xs text-neutral-500">{email}</p>
          </div>
        </div>
        <DottedSeparator className="mb-1" />
        <NotificationsMenuItems
          workspaceId={workspaceId}
          chatUnreadCount={unreadCount}
          systemUnreadCount={systemUnreadCount}
        />
        <DottedSeparator className="my-1" />
        <DropdownMenuItem
          onClick={() => logout()}
          className="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer"
        >
          <LogOut className="size-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
