"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/ui/dropdown-menu";
import { DottedSeparator } from "@/src/ui/dotted-separator";

import { useLogout } from "../api/use-logout";
import { useCurrent } from "../api/use-current";
import { Loader, LogOut } from "lucide-react";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import { useChatUnread } from "@/src/features/chat/api/use-chat-unread";
import { useSyncProfile } from "../api/use-sync-profile";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChatRealtime } from "@/src/features/chat/hooks/use-chat-realtime";

export const UserButton = () => {
  const { data: user, isLoading } = useCurrent();
  const { mutate: logout } = useLogout();

  const workspaceId = useWorkspaceId() as string | undefined;
  const { data: unreadData } = useChatUnread(workspaceId);
  const { mutate: syncProfile } = useSyncProfile();
  const didTrySync = useRef(false);
  const queryClient = useQueryClient();
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

  const handleUnreadRealtime = useCallback(() => {
    if (!workspaceId) return;
    queryClient.invalidateQueries({
      queryKey: ["chat", "unread", workspaceId],
    });
  }, [queryClient, workspaceId]);

  useChatRealtime({
    workspaceId,
    enabled: !!workspaceId,
    onMessage: handleUnreadRealtime,
  });

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
  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative cursor-pointer">
        {unreadCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-red-500 ring-2 ring-white text-[10px] leading-4 font-semibold text-white flex items-center justify-center">
            {unreadLabel}
          </span>
        ) : null}
        <Avatar className="size-10 hover:opacity-75 transition border border-neutral-300">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name || email} /> : null}
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
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name || email} /> : null}
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
        <DropdownMenuItem
          onClick={() => logout()}
          className="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer"
        >
          <LogOut className="size-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
