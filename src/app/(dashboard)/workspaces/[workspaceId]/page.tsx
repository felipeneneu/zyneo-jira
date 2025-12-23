import { getCurrent } from "@/src/features/auth/queries";
import { redirect } from "next/navigation";

const WorkspaceIdPage = async ({ params }) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const param = await params;

  return (
    <div>
      <div>Workspace Id {param.workspaceId}</div>
    </div>
  );
};

export default WorkspaceIdPage;
