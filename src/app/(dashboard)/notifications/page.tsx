import { getCurrent } from "@/src/features/auth/queries";
import { NotificationsList } from "@/src/features/notification/components/notifications-list";
import { ScrollArea, ScrollBar } from "@/src/ui/scroll-area";
import { redirect } from "next/navigation";

const NotificationsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex h-full w-full">
      <main className="flex-1 overflow-hidden">
        <NotificationsList />
      </main>
    </div>
  );
};
export default NotificationsPage;
