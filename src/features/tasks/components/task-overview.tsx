import { Button } from "@/src/ui/button";
import { Task } from "../types";
import { PencilIcon, Clock, AlertTriangle, Ban } from "lucide-react";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { OverviewProperty } from "./overview-property";
import { MembersAvatar } from "../../members/components/members-avatar";
import { TaskDate } from "./task-date";
import { Badge } from "@/src/ui/badge";
import { snakeCaseToTitleCase, cn } from "@/src/lib/utils";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";

const flagConfig = {
  stale: {
    icon: Clock,
    label: "Parada",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  overdue: {
    icon: AlertTriangle,
    label: "Atrasada",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  blocked: {
    icon: Ban,
    label: "Bloqueada",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
} as const;

interface TaskOverviewProps {
  task: Task;
}
export const TaskOverview = ({ task }: TaskOverviewProps) => {
  const { open } = useEditTaskModal();
  const flags = (task.flags as string[] | undefined) ?? [];

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">Visão geral</p>
            {flags.map((flag) => {
              const config = flagConfig[flag as keyof typeof flagConfig];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <span
                  key={flag}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                    config.className,
                  )}
                >
                  <Icon className="size-3" />
                  {config.label}
                </span>
              );
            })}
          </div>
          <Button
            size={"sm"}
            variant={"secondary"}
            onClick={() => open(task.$id)}
          >
            <PencilIcon className="size-4 mr-2" />
            Editar
          </Button>
        </div>
        <DottedSeparator className="my-4" />

        <div className="flex flex-col gap-y-4">
          {task.taskKey ? (
            <OverviewProperty label="Key:">
              <p className="text-sm font-medium">{task.taskKey}</p>
            </OverviewProperty>
          ) : null}
          <OverviewProperty label="Assinatura:">
            <MembersAvatar
              name={task.assignee?.name ?? "Unknown"}
              className="size-6"
            />
            <p className="text-sm font-medium">
              {task.assignee?.name ?? "Unassigned"}
            </p>
          </OverviewProperty>

          <OverviewProperty label="Data de vencimento:">
            <TaskDate value={task.dueDate} className="text-sm font-medium" />
          </OverviewProperty>

          <OverviewProperty label="Status:">
            <Badge variant={task.status}>
              {snakeCaseToTitleCase(task.status)}
            </Badge>
          </OverviewProperty>
        </div>
      </div>
    </div>
  );
};
