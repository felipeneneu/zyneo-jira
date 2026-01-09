"use client";

import { PageError } from "@/src/app/components/page-error";
import { PageLoader } from "@/src/app/components/page-loader";
import { useGetProject } from "@/src/features/projects/api/use-get-project";
import { ProjectAvatar } from "@/src/features/projects/components/project-avatar";
import { useProjectId } from "@/src/features/projects/hooks/use-project-id";
import { TaskViewSwitcher } from "@/src/features/tasks/components/task-view-switcher";
import { Button } from "@/src/ui/button";
import { PencilIcon } from "lucide-react";
import Link from "next/link";

export const ProjectIdClient = () => {
  const projectId = useProjectId();
  const { data, isLoading } = useGetProject({ projectId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!data) {
    return <PageError message="Project not found" />;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={data.name}
            image={data.imageUrl}
            className="size-10"
          />
          <p className="text-lg font-semibold">{data.name}</p>
        </div>
        <Button variant={"secondary"} size={"sm"} asChild>
          <Link
            href={`/workspaces/${data.workspaceId}/projects/${data.$id}/settings`}
          >
            <PencilIcon className="size-4 mr-2" />
            Edit Project
          </Link>
        </Button>
      </div>
      <TaskViewSwitcher hideProjectFilters />
    </div>
  );
};
