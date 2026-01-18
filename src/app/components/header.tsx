"use client";
import { useCurrent } from "@/src/features/auth/api/use-current";
import { UserButton } from "@/src/features/auth/components/user-button";
import { useChatUnread } from "@/src/features/chat/api/use-chat-unread";
import { NotificationsMenuItems } from "@/src/features/notifications/components/notifications-menu-items";
import { useGetNotifications } from "@/src/features/notifications/api/use-get-notifications";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/ui/dropdown-menu";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Calendar, Loader, Search } from "lucide-react";

const Header = () => {
  const { data: user, isLoading } = useCurrent();
  const workspaceId = useWorkspaceId() as string | undefined;
  const { data: unreadData } = useChatUnread(workspaceId);
  const { data: systemUnreadData } = useGetNotifications({
    filter: "unread",
    enabled: !!user,
  });
  const unreadCount =
    (unreadData && "count" in unreadData ? unreadData.count : 0) ??
    (unreadData?.unread ? 1 : 0);
  const systemUnreadCount = systemUnreadData?.total ?? 0;
  const totalUnreadCount = unreadCount + systemUnreadCount;
  const unreadLabel = totalUnreadCount > 99 ? "99+" : String(totalUnreadCount);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <header className="hidden md:block">
      <div className="flex items-center justify-between  px-6 py-6">
        <h1 className="text-xl font-normal">
          Bem-vindo de volta, <b> {user?.name} </b>
        </h1>
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-black">
            <Search className="h-5 w-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative text-gray-500 hover:text-black"
                aria-label="Notificacoes"
              >
                {totalUnreadCount > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-red-500 ring-2 ring-white text-[10px] leading-4 font-semibold text-white flex items-center justify-center">
                    {unreadLabel}
                  </span>
                ) : null}
                <Bell className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <NotificationsMenuItems
                workspaceId={workspaceId}
                chatUnreadCount={unreadCount}
                systemUnreadCount={systemUnreadCount}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          <UserButton />
        </div>
      </div>
      <DottedSeparator className="" />
    </header>
  );
};

export default Header;
