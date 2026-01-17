import { redirect } from "next/navigation";
import { getCurrent } from "../../features/auth/queries";
// import { CreateWorkspaceForm } from "@/src/features/workspaces/components/create-workspace-form";
import { getWorkspace } from "@/src/features/workspaces/queries";
import { RedirectToCreateWorkspaceModal } from "@/src/features/workspaces/components/redirect-to-create-workspace-modal";

export default async function Home() {
  const user = await getCurrent();

  if (!user) {
    redirect("/sign-in");
  }

  const workspace = await getWorkspace();
  if (workspace.total === 0) {
    return <RedirectToCreateWorkspaceModal />;
  } else {
    const first = workspace.documents[0];
    const slugOrId = first.slug ?? first.$id;
    redirect(`/workspaces/${slugOrId}`);
  }
}
