import { getCurrent } from "@/src/features/auth/queries";
import { EditProjectForm } from "@/src/features/projects/components/edit-project-form";
import { GetProject } from "@/src/features/projects/queries";
import { redirect } from "next/navigation";

interface ProjectIdStttingsPageProps {
  params: {
    projectId: string;
  };
}

const ProjectIdStttingsPage = async ({
  params,
}: ProjectIdStttingsPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const param = await params;

  const initialValues = await GetProject({
    projectId: param.projectId,
  });

  if (!initialValues) redirect("/");

  return (
    <div className="w-full lg:max-w-xl">
      <EditProjectForm initialValues={initialValues} />
    </div>
  );
};

export default ProjectIdStttingsPage;
