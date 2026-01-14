import { redirect } from "next/navigation";

import { getCurrent } from "@/src/features/auth/queries";
import { ChatWorkspaceClient } from "./client";

const ChatPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="h-full flex flex-col">
      <ChatWorkspaceClient />
    </div>
  );
};

export default ChatPage;
