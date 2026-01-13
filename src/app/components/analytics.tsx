import { ProjectAnalyticsResponseType } from "@/src/features/projects/api/use-get-project-analytics";
import { ScrollArea, ScrollBar } from "@/src/ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";
import { DottedSeparator } from "@/src/ui/dotted-separator";

export const Analytics = ({ data }: ProjectAnalyticsResponseType) => {
  if (!data) return null;
  return (
    <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
      <div className="w-full flex flex-row">
        <div className="flex items-center flex-1 min-w-[220px]">
          <AnalyticsCard
            title="Total Tarefas"
            value={data.taskCount}
            variant={data.taskDifference > 0 ? "up" : "down"}
            increaseValue={data.taskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1 min-w-[220px]">
          <AnalyticsCard
            title="Tarefas Atribuídas"
            value={data.assignedTaskCount}
            variant={data.assignedTaskCountDifference > 0 ? "up" : "down"}
            increaseValue={data.assignedTaskCountDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1 min-w-[220px]">
          <AnalyticsCard
            title="Tarefas Concluídas"
            value={data.completedTaskCount}
            variant={data.completedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.completedTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1 min-w-[220px]">
          <AnalyticsCard
            title="Tarefas Vencidas"
            value={data.overdueTaskCount}
            variant={data.overdueTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.overdueTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1 min-w-[220px]">
          <AnalyticsCard
            title="Tarefas Pendentes"
            value={data.incompleteTaskCount}
            variant={data.incompleteTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.incompleteTaskDifference}
          />
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
