import { NotificationsList } from "@/src/features/notification/components/notifications-list";

export default function NotificationsPage() {
  return (
    <div className="flex h-screen bg-[#f5f5f5]">
      <main className="flex-1 overflow-auto">
        <NotificationsList />
      </main>
    </div>
  );
}
