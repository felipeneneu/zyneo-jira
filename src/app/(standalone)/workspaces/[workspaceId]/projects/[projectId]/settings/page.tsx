import { getCurrent } from "@/src/features/auth/queries";
import { redirect } from "next/navigation";
import { ProjectIdSettingsClient } from "./client";

const ProjectIdStttingsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <ProjectIdSettingsClient />;
};

export default ProjectIdStttingsPage;
