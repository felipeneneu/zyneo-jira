import { getCurrent } from "@/src/features/auth/actions";
import { redirect } from "next/navigation";

const WorkspaceIdPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");
  return (
    <div>
      <div>Workspace Id</div>
    </div>
  );
};

export default WorkspaceIdPage;
