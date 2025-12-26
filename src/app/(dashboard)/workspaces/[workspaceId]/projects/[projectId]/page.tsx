import { getCurrent } from "@/src/features/auth/queries";
import { ProjectAvatar } from "@/src/features/projects/components/project-avatar";
import { GetProject } from "@/src/features/projects/queries";
import { TaskViewSwitcher } from "@/src/features/tasks/components/task-view-switcher";
import { Button } from "@/src/ui/button";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface ProjectIdPageProps {
  params: { projectId: string };
}

const ProjectIdPage = async ({ params }: ProjectIdPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const param = await params;

  const initialValues = await GetProject({
    projectId: param.projectId,
  });

  if (!initialValues) {
    throw new Error("Project not found");
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={initialValues.name}
            image={initialValues.imageUrl}
            className="size-10"
          />
          <p className="text-lg font-semibold">{initialValues.name}</p>
        </div>
        <Button variant={"secondary"} size={"sm"} asChild>
          <Link
            href={`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}/settings`}
          >
            <PencilIcon className="size-4 mr-2" />
            Edit Project
          </Link>
        </Button>
      </div>
      <TaskViewSwitcher />
    </div>
  );
};

export default ProjectIdPage;
