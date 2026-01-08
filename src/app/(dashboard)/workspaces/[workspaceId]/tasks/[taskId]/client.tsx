"use client";

import { PageError } from "@/src/app/components/page-error";
import { PageLoader } from "@/src/app/components/page-loader";
import { useGetTask } from "@/src/features/tasks/api/use-get-task";
import { TaskBreadcrumbs } from "@/src/features/tasks/components/task-breadcrumbs";
import { TaskDescription } from "@/src/features/tasks/components/task-description";
import { TaskOverview } from "@/src/features/tasks/components/task-overview";
import { useTaskId } from "@/src/features/tasks/hooks/use-task-id";
import { DottedSeparator } from "@/src/ui/dotted-separator";

export const TaskIdClient = () => {
  const taskId = useTaskId();
  const { data, isLoading } = useGetTask({ taskId });
  if (isLoading) {
    return <PageLoader />;
  }

  if (!data) {
    return <PageError message="Task not found" />;
  }
  return (
    <div className="flex flex-col">
      <TaskBreadcrumbs project={data.project} task={data} />
      <DottedSeparator className="my-4" />
      <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
        <TaskOverview task={data} />
        <TaskDescription task={data} />
      </div>
    </div>
  );
};
