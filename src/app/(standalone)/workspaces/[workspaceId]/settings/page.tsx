import { redirect } from "next/navigation";
import { getCurrent } from "@/src/features/auth/queries";
import { WorkspaceIdSettignsClient } from "./client";

const WorkspaceIdSettingsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");
  return <WorkspaceIdSettignsClient />;
};

export default WorkspaceIdSettingsPage;
