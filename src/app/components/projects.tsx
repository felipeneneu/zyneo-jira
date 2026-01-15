"use client";

import { useGetProjects } from "@/src/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/src/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/src/features/projects/hooks/use-create-project-modal";
import { useGetWorkspace } from "@/src/features/workspaces/api/use-get-workspace-id";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import { getWorkspacePreset } from "@/src/features/workspaces/domain/workspace-presets";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

export const Projects = () => {
  const { open } = useCreateProjectModal();

  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ workspaceId });
  const preset = getWorkspacePreset(workspace?.workspaceType);
  const capabilities = workspace?.capabilities ?? preset?.capabilities;
  const canShowProjects = capabilities ? capabilities.includes("projects") : true;
  const { data } = useGetProjects({ workspaceId, enabled: canShowProjects });

  if (!canShowProjects) {
    return null;
  }
  return (
    <div className="flex flex-col gap-y-2">
      <div className=" flex items-center justify-between mb-2">
        <p className="text-xs uppercase text-neutral-500">Projetos</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>
      {data?.documents.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;

        return (
          <Link href={href} key={project.$id}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <ProjectAvatar name={project.name} image={project.imageUrl} />
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
