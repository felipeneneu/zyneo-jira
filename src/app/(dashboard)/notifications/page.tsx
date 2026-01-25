import { getCurrent } from "@/src/features/auth/queries";
import { NotificationsList } from "@/src/features/notification/components/notifications-list";
import { redirect } from "next/navigation";

const NotificationsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex h-screen bg-[#f5f5f5]">
      <main className="flex-1 overflow-auto">
        <NotificationsList />
      </main>
    </div>
  );
};
export default NotificationsPage;
