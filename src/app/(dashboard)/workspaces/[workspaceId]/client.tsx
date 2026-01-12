"use client";

import { Analytics } from "@/src/app/components/analytics";
import { PageError } from "@/src/app/components/page-error";
import { PageLoader } from "@/src/app/components/page-loader";
import { useGetMembers } from "@/src/features/members/api/use-get-members";
import { MembersAvatar } from "@/src/features/members/components/members-avatar";
import { Member } from "@/src/features/members/types";
import { useGetProjects } from "@/src/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/src/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/src/features/projects/hooks/use-create-project-modal";
import { Project } from "@/src/features/projects/types";
import { useGetTasks } from "@/src/features/tasks/api/use-get-tasks";
import { useCreateTaskModal } from "@/src/features/tasks/hooks/use-create-task-modal";
import { Task } from "@/src/features/tasks/types";
import { useGetWorkspaceAnalytics } from "@/src/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import { Button } from "@/src/ui/button";
import { Card, CardContent } from "@/src/ui/card";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, PlusIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();

  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
  });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const isLoading =
    isLoadingAnalytics ||
    isLoadingMembers ||
    isLoadingProjects ||
    isLoadingTasks;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!analytics || !tasks || !projects || !members) {
    return <PageError message="Failed to load workspace data" />;
  }

  return (
    <div className="h-full flex flex-col space-y-4 w-full">
      <Analytics data={analytics} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 ">
        <TaskList data={tasks.documents} total={tasks.total} />
        <ProjectList data={projects.documents} total={projects.total} />
        <MembersList data={members.documents} total={members.total} />
      </div>
    </div>
  );
};

interface TaskListProps {
  data: Task[];
  total: number;
}

export const TaskList = ({ data, total }: TaskListProps) => {
  const { open: createTask } = useCreateTaskModal();
  const workspaceId = useWorkspaceId();
  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Tasks ({total})</p>
          <Button
            variant={"muted"}
            size={"icon"}
            onClick={() => createTask()}
            className="cursor-pointer"
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="flex flex-col gap-y-4">
          {data.map((task) => (
            <li key={task.$id}>
              <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                <Card className="rounded-lg border-none shadow-none hover:opacity-75 transition">
                  <CardContent>
                    <p className="text-lg font-medium truncate">{task.name}</p>
                    <div className="flex items-center gap-x-2">
                      <p className="text-sm">{task.project?.name}</p>
                      <div className="size-1.5 rounded-full bg-neutral-300" />
                      <div className="text-sm text-muted-foreground flex items-center">
                        <CalendarIcon className="size-3 mr-1" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No tasks found
          </li>
          <Button variant={"muted"} className="mt-4 w-full" asChild>
            <Link href={`/workspaces/${workspaceId}/tasks`}>Show All</Link>
          </Button>
        </ul>
      </div>
    </div>
  );
};

interface ProjectListProps {
  data: Project[];
  total: number;
}

export const ProjectList = ({ data, total }: ProjectListProps) => {
  const { open: createProject } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();
  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Projects ({total})</p>
          <Button
            variant={"secondary"}
            size={"icon"}
            onClick={() => createProject()}
            className="cursor-pointer"
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <div className="w-full">
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            {data.map((project) => (
              <li key={project.$id}>
                <Link
                  href={`/workspaces/${workspaceId}/projects/${project.$id}`}
                >
                  <Card className="rounded-lg border shadow-none hover:opacity-75 transition">
                    <CardContent className="flex items-center gap-x-2.5">
                      <ProjectAvatar
                        className="size-12"
                        fallbackClassName="text-lg"
                        name={project.name}
                        image={project.imageUrl}
                      />
                      <p className="text-lg font-medium truncate">
                        {project.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
            <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
              No projects found
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

interface MembersListProps {
  data: Member[];
  total: number;
}

export const MembersList = ({ data, total }: MembersListProps) => {
  const workspaceId = useWorkspaceId();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Members ({total})</p>
          <Button
            variant={"secondary"}
            size={"icon"}
            className="cursor-pointer"
            asChild
          >
            <Link href={`/workspaces/${workspaceId}/members`}>
              <SettingsIcon className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <div className="w-full">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {data.map((member) => (
              <li key={member.$id}>
                <Card className="shadow-none rounded-lg overflow-hidden">
                  <CardContent className="flex flex-col items-center gap-x-2.5">
                    <MembersAvatar
                      className="size-12"
                      fallbackClassName="text-lg"
                      name={member.name}
                    />
                    <div className="flex flex-col items-center overflow-hidden">
                      <p className="text-lg font-medium line-clamp-1">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {member.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
            <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
              No members found
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
