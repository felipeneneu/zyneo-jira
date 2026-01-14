"use client";

import { PageError } from "@/src/app/components/page-error";
import { PageLoader } from "@/src/app/components/page-loader";
import { useGetWorkspace } from "@/src/features/workspaces/api/use-get-workspace-id";

import { EditWorkspaceForm } from "@/src/features/workspaces/components/edit-workspace-form";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";

export const WorkspaceIdSettignsClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues) {
    return <PageError message="Workspace not found" />;
  }
  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} />
    </div>
  );
};
