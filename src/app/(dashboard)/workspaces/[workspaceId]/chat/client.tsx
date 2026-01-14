"use client";

import { WorkspaceChat } from "@/src/features/chat/components/workspace-chat";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";

export const ChatWorkspaceClient = () => {
  const workspaceId = useWorkspaceId();

  return (
    <div className="h-full flex flex-col">
      <WorkspaceChat workspaceId={workspaceId} />
    </div>
  );
};
