import { redirect } from "next/navigation";
import { getCurrent } from "../../features/auth/actions";
// import { CreateWorkspaceForm } from "@/src/features/workspaces/components/create-workspace-form";
import { getWorkspace } from "@/src/features/workspaces/actions";

export default async function Home() {
  const user = await getCurrent();

  if (!user) {
    redirect("/sign-in");
  }

  const workspace = await getWorkspace();
  if (workspace.total === 0) {
    redirect("/workspaces/create");
  } else {
    redirect(`/workspaces/${workspace.documents[0].$id}`);
  }
}
