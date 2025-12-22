import { getCurrent } from "@/src/features/auth/queries";
import { CreateWorkspaceForm } from "@/src/features/workspaces/components/create-workspace-form";
import { redirect } from "next/navigation";

const WorkspaceCreatePage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");
  return (
    <div className="w-full lg:max-w-xl">
      <CreateWorkspaceForm />
    </div>
  );
};

export default WorkspaceCreatePage;
