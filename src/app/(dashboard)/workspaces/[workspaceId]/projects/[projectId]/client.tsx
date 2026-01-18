"use client";

import { Analytics } from "@/src/app/components/analytics";
import { PageError } from "@/src/app/components/page-error";
import { PageLoader } from "@/src/app/components/page-loader";
import { useGetProject } from "@/src/features/projects/api/use-get-project";
import { useGetProjectAnalytics } from "@/src/features/projects/api/use-get-project-analytics";
import { ProjectAvatar } from "@/src/features/projects/components/project-avatar";
import { useProjectId } from "@/src/features/projects/hooks/use-project-id";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import { TaskViewSwitcher } from "@/src/features/tasks/components/task-view-switcher";
import { Button } from "@/src/ui/button";
import { PencilIcon } from "lucide-react";
import Link from "next/link";

export const ProjectIdClient = () => {
  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId,
  });
  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetProjectAnalytics({ projectId });

  const isLoading = isLoadingProject || isLoadingAnalytics;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!project || !analytics) {
    return <PageError message="Project not found" />;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={project.name}
            image={project.imageUrl}
            className="size-10"
          />
          <p className="text-lg font-semibold">{project.name}</p>
        </div>
        <Button variant={"secondary"} size={"sm"} asChild>
          <Link
            href={`/workspaces/${workspaceId}/projects/${project.$id}/settings`}
          >
            <PencilIcon className="size-4 mr-2" />
            Editar Projeto
          </Link>
        </Button>
      </div>
      {analytics ? <Analytics data={analytics} /> : null}
      <TaskViewSwitcher hideProjectFilters />
    </div>
  );
};
