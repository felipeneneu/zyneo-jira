"use client";
import { Loader, PlusIcon } from "lucide-react";

import { Button } from "@/src/ui/button";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/ui/tabs";

import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useQueryState } from "nuqs";
import { DataFilters } from "./data-filters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./data-kanban";
import { useCallback } from "react";
import { TaskStatus } from "../types";
import { useBulkUpdateTask } from "../api/use-bulk-update-task";
import { DataCalendar } from "./data-calendar";
import { BacklogView } from "./backlog-view";
import { useProjectId } from "../../projects/hooks/use-project-id";
import { useGetWorkspace } from "../../workspaces/api/use-get-workspace-id";
import { getWorkspaceStatuses } from "../utils/task-statuses";
import { DevGuidedTutorial } from "../../tutorial/dev-guided-tutorial";

interface TaskViewSwitcherProps {
  hideProjectFilters?: boolean;
}

export const TaskViewSwitcher = ({
  hideProjectFilters,
}: TaskViewSwitcherProps) => {
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  const [{ status, assigneeId, projectId, dueDate }] = useTaskFilters();

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { open } = useCreateTaskModal();
  const { data: workspace } = useGetWorkspace({ workspaceId });
  const statuses = getWorkspaceStatuses(workspace?.workspaceType);

  const { mutate: bulkUpdate } = useBulkUpdateTask();

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    projectId: paramProjectId || projectId,
    assigneeId,
    status,
    dueDate,
  });

  const onKanbanChange = useCallback(
    (
      tasks: {
        $id: string;
        status: TaskStatus;
        position: number;
      }[]
    ) => {
      bulkUpdate({
        json: { tasks },
      });
    },
    [bulkUpdate]
  );

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="flex-1 w-full border rounded-lg"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
              Tabelas
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="kaban">
              Kanban
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="calendar">
              Calendario
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="backlog">
              Backlog
            </TabsTrigger>
          </TabsList>
          <Button
            size={"sm"}
            className="w-full lg:w-auto"
            onClick={() => open()}
          >
            <PlusIcon className="size-4 mr-2" />
            Novo
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <DataFilters
          hideProjectFilters={hideProjectFilters}
          statuses={[...statuses]}
        />
        <DottedSeparator className="my-4" />
        {/* <DevGuidedTutorial
          workspaceId={workspaceId}
          workspaceType={workspace?.workspaceType}
          tasks={tasks?.documents ?? []}
        /> */}
        {isLoadingTasks ? (
          <div className="w-full border rounded-lg h-50 flex flex-col items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <DataTable columns={columns} data={tasks?.documents ?? []} />
            </TabsContent>
            <TabsContent value="kaban" className="mt-0">
              <DataKanban
                onChange={onKanbanChange}
                data={tasks?.documents ?? []}
                boards={[...statuses]}
              />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0">
              <DataCalendar data={tasks?.documents ?? []} />
            </TabsContent>

            <TabsContent value="backlog" className="mt-0">
              <BacklogView tasks={tasks?.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
