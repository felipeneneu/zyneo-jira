import { redirect } from "next/navigation";
import { getCurrent } from "@/src/features/auth/queries";
import { EditWorkspaceForm } from "@/src/features/workspaces/components/edit-workspace-form";
import { getWorkspaceById } from "@/src/features/workspaces/queries";

interface WorkspaceIdSettingsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

const WorkspaceIdSettingsPage = async ({
  params,
}: WorkspaceIdSettingsPageProps) => {
  const user = await getCurrent();
  const { workspaceId } = await params;

  const initialValues = await getWorkspaceById({ workspaceId: workspaceId });

  if (!initialValues) redirect(`/workspaces/${workspaceId}`);
  if (!user) redirect("/sign-in");
  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} />
    </div>
  );
};

export default WorkspaceIdSettingsPage;
