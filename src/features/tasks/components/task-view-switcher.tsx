"use client";
import { Loader, PlusIcon, FileText, FileDown } from "lucide-react";

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
import { useCallback, useMemo, useState } from "react";
import { TaskStatus } from "../types";
import { useBulkUpdateTask } from "../api/use-bulk-update-task";
import { DataCalendar } from "./data-calendar";
import { BacklogView } from "./backlog-view";
import { useProjectId } from "../../projects/hooks/use-project-id";
import { useGetWorkspace } from "../../workspaces/api/use-get-workspace-id";
import { getWorkspaceStatuses } from "../utils/task-statuses";
import { DevGuidedTutorial } from "../../tutorial/dev-guided-tutorial";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { CsvImporter } from "./csv-importer";
import { generateTasksReport } from "../utils/generate-tasks-report";
import { useGenerateTasksReport } from "../api/use-generate-tasks-report";
import { generateTasksCsv } from "../utils/generate-tasks-csv";
import { toast } from "sonner";

interface TaskViewSwitcherProps {
  hideProjectFilters?: boolean;
}

export const TaskViewSwitcher = ({
  hideProjectFilters,
}: TaskViewSwitcherProps) => {
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const reportInsights = useGenerateTasksReport();
  const isFriday = new Date().getDay() === 5;

  const [{ status, assigneeId, projectId, dueDate }] = useTaskFilters();

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { open } = useCreateTaskModal();
  const { data: workspace } = useGetWorkspace({ workspaceId });
  const { data: projects } = useGetProjects({
    workspaceId,
    enabled: !!workspaceId,
  });
  const statuses = getWorkspaceStatuses(workspace?.workspaceType);

  const { mutate: bulkUpdate } = useBulkUpdateTask();

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    projectId: paramProjectId || projectId,
    assigneeId,
    status,
    dueDate,
  });

  const resolvedProjectId = useMemo(() => {
    if (paramProjectId || projectId) {
      return paramProjectId || projectId;
    }
    if (projects?.documents.length === 1) {
      return projects.documents[0].$id;
    }
    return undefined;
  }, [paramProjectId, projectId, projects?.documents]);

  const handleGenerateReport = async () => {
    const currentTasks = tasks?.documents ?? [];
    if (currentTasks.length === 0) {
      toast.error("Não há tarefas para gerar o relatório.");
      return;
    }
    if (!workspaceId) {
      toast.error("Workspace não encontrado.");
      return;
    }
    if (!isFriday) {
      toast.error("Relatório disponível apenas às sextas-feiras.");
      return;
    }
    try {
      setIsGeneratingReport(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
      const response = await reportInsights.mutateAsync({
        json: {
          workspaceId,
          taskIds: currentTasks.map((task) => task.$id),
        },
      });
      await generateTasksReport(currentTasks, response.data.insights);
    } catch {
      toast.error("Falha ao gerar relatório.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportCsv = async () => {
    const currentTasks = tasks?.documents ?? [];
    if (currentTasks.length === 0) {
      toast.error("Não há tarefas para exportar.");
      return;
    }
    try {
      setIsExportingCsv(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
      generateTasksCsv(currentTasks);
    } catch {
      toast.error("Falha ao exportar CSV.");
    } finally {
      setIsExportingCsv(false);
    }
  };

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
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
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
            {view === "table" ? (
              <>
                <CsvImporter
                  workspaceId={workspaceId}
                  projectId={resolvedProjectId ?? undefined}
                  defaultStatus={status ?? TaskStatus.BACKLOG}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport || !isFriday}
                  title={
                    isFriday
                      ? "Gerar relatório com overview"
                      : "Disponível apenas às sextas-feiras"
                  }
                >
                  <FileText className="size-4" />
                  {isGeneratingReport ? "Gerando..." : "Gerar Relatório"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                  onClick={handleExportCsv}
                  disabled={isExportingCsv}
                >
                  <FileDown className="size-4" />
                  {isExportingCsv ? "Exportando..." : "Exportar CSV"}
                </Button>
              </>
            ) : null}
          </div>
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
