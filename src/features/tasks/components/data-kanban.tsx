import { useCallback, useEffect, useMemo, useState } from "react";
import { Task, TaskStatus } from "../types";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/src/ui/drawer";
import { Button } from "@/src/ui/button";
import { Checkbox } from "@/src/ui/checkbox";
import { Badge } from "@/src/ui/badge";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useGetMembers } from "../../members/api/use-get-members";
import { useCurrent } from "../../auth/api/use-current";
import { useUpdateTask } from "../api/use-update-task";
import { getPriority } from "../utils/task-flags";
import { cn } from "@/src/lib/utils";

const defaultBoards: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

type TasksState = {
  [key in TaskStatus]: Task[];
};

interface PendingMove {
  movedTask: Task;
  sourceStatus: TaskStatus;
  destStatus: TaskStatus;
  updatesPayload: { $id: string; status: TaskStatus; position: number }[];
  nextTasks: TasksState;
}

const COPILOT_STORAGE_KEY = "kanban:copilot:auto-assign";
const DEFAULT_COPILOT_ENABLED = true;

const buildTasksState = (data: Task[]): TasksState => {
  const tasksState: TasksState = {
    [TaskStatus.BACKLOG]: [],
    [TaskStatus.READY]: [],
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.IN_REVIEW]: [],
    [TaskStatus.DONE]: [],
  };

  data.forEach((task) => {
    tasksState[task.status].push(task);
  });

  Object.keys(tasksState).forEach((status) => {
    tasksState[status as TaskStatus].sort((a, b) => a.position - b.position);
  });

  return tasksState;
};

interface DataKanbanProps {
  data: Task[];
  boards?: TaskStatus[];
  onChange: (
    tasks: { $id: string; status: TaskStatus; position: number }[]
  ) => void;
}

export const DataKanban = ({
  data,
  onChange,
  boards = defaultBoards,
}: DataKanbanProps) => {
  const workspaceId = useWorkspaceId();
  const { data: members } = useGetMembers({ workspaceId });
  const { data: currentUser } = useCurrent();
  const updateTask = useUpdateTask();

  const dataKey = useMemo(
    () =>
      data
        .map((task) => `${task.$id}:${task.status}:${task.position}`)
        .join("|"),
    [data]
  );
  const [override, setOverride] = useState<{
    key: string;
    tasks: TasksState;
  } | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [copilotEnabled, setCopilotEnabled] = useState(
    DEFAULT_COPILOT_ENABLED
  );
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const tasks = useMemo(() => {
    if (override?.key === dataKey) {
      return override.tasks;
    }

    return buildTasksState(data);
  }, [data, dataKey, override]);

  const currentMemberId = useMemo(() => {
    if (!currentUser?.$id) return null;
    return (
      members?.documents.find((member) => member.userId === currentUser.$id)
        ?.$id ?? null
    );
  }, [currentUser?.$id, members?.documents]);

  useEffect(() => {
    const stored = localStorage.getItem(COPILOT_STORAGE_KEY);
    if (stored === "true" || stored === "false") {
      setCopilotEnabled(stored === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(COPILOT_STORAGE_KEY, String(copilotEnabled));
  }, [copilotEnabled]);

  const wipCount = tasks[TaskStatus.IN_PROGRESS]?.length ?? 0;
  const wipOverLimit = wipCount >= 5;

  const applyAutoUpdates = useCallback(
    async (task: Task, destStatus: TaskStatus) => {
      if (!copilotEnabled) return;

      const needsAssignee = !task.assigneeId;
      const needsPriority =
        destStatus === TaskStatus.READY && !getPriority(task.flags);

      const shouldAssign = needsAssignee && Boolean(currentMemberId);
      const shouldSetPriority = needsPriority;

      if (!shouldAssign && !shouldSetPriority) return;

      await updateTask.mutateAsync({
        param: { taskId: task.$id },
        json: {
          ...(shouldAssign ? { assigneeId: currentMemberId ?? undefined } : {}),
          ...(shouldSetPriority ? { priority: "P2" } : {}),
        },
      });
    },
    [copilotEnabled, currentMemberId, updateTask]
  );

  const applyMoveNow = useCallback(
    async (move: PendingMove) => {
      try {
        await applyAutoUpdates(move.movedTask, move.destStatus);
        onChange(move.updatesPayload);
      } catch {
        setOverride(null);
      }
    },
    [applyAutoUpdates, onChange]
  );

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const { source, destination } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      let updatesPayload: {
        $id: string;
        status: TaskStatus;
        position: number;
      }[] = [];

      const newTasks = { ...tasks };

      // Safely remove the task from the source column
      const sourceColumn = [...newTasks[sourceStatus]];
      const [movedTask] = sourceColumn.splice(source.index, 1);

      // if there`s no moved task (shouldn`t happen, but just in case)

      if (!movedTask) {
        return;
      }

      // Create a new task object with potentially update status

      const updatedMovedTask =
        sourceStatus !== destStatus
          ? { ...movedTask, status: destStatus }
          : movedTask;

      //Update the source column
      newTasks[sourceStatus] = sourceColumn;

      // Add the task to the destination column
      const destColumn = [...newTasks[destStatus]];
      destColumn.splice(destination.index, 0, updatedMovedTask);
      newTasks[destStatus] = destColumn;

      // Prepare minimal update payloads
      updatesPayload = [];

      // Always update the moved task
      updatesPayload.push({
        $id: updatedMovedTask.$id,
        status: destStatus,
        position: Math.min((destination.index + 1) * 1000, 1_000_000),
      });

      // Update positions for affected tasks in the destination column

      newTasks[destStatus].forEach((task, index) => {
        if (task && task.$id !== updatedMovedTask.$id) {
          const newPosition = Math.min((index + 1) * 1000, 1_000_000);
          if (task.position !== newPosition) {
            updatesPayload.push({
              $id: task.$id,
              status: destStatus,
              position: newPosition,
            });
          }
        }
      });

      // If the task moved between columns, update positions in the source column

      if (sourceStatus !== destStatus) {
        newTasks[sourceStatus].forEach((task, index) => {
          if (task) {
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);
            if (task.position !== newPosition) {
              updatesPayload.push({
                $id: task.$id,
                status: sourceStatus,
                position: newPosition,
              });
            }
          }
        });
      }

      setOverride({ key: dataKey, tasks: newTasks });

      if (destStatus === TaskStatus.DONE) {
        setAutoAssignEnabled(copilotEnabled && !movedTask.assigneeId);
        setPendingMove({
          movedTask,
          sourceStatus,
          destStatus,
          updatesPayload,
          nextTasks: newTasks,
        });
        setIsConfirmOpen(true);
        return;
      }

      void applyMoveNow({
        movedTask,
        sourceStatus,
        destStatus,
        updatesPayload,
        nextTasks: newTasks,
      });
    },
    [applyMoveNow, copilotEnabled, dataKey, tasks]
  );

  const handleCancelMove = () => {
    setOverride(null);
    setPendingMove(null);
    setIsConfirmOpen(false);
  };

  const handleConfirmMove = async () => {
    if (!pendingMove) return;

    const { movedTask, destStatus, updatesPayload } = pendingMove;
    const needsAssignee = !movedTask.assigneeId;
    const shouldAssign =
      copilotEnabled &&
      autoAssignEnabled &&
      needsAssignee &&
      Boolean(currentMemberId);

    try {
      if (shouldAssign) {
        await updateTask.mutateAsync({
          param: { taskId: movedTask.$id },
          json: {
            ...(shouldAssign ? { assigneeId: currentMemberId ?? undefined } : {}),
          },
        });
      }

      onChange(updatesPayload);
      setPendingMove(null);
      setIsConfirmOpen(false);
    } catch {
      handleCancelMove();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>WIP atual: {wipCount}</span>
          {wipOverLimit ? (
            <Badge className="bg-amber-100 text-amber-700">WIP alto</Badge>
          ) : null}
        </div>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={copilotEnabled}
            onCheckedChange={(value) => setCopilotEnabled(value === true)}
          />
          Copiloto ativo
        </label>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex overflow-x-auto">
          {boards.map((board) => {
            return (
              <div
                key={board}
                className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-50"
              >
                <KanbanColumnHeader
                  board={board}
                  taskCount={tasks[board].length}
                />
                <Droppable droppableId={board}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-50 py-1.5"
                    >
                      {tasks[board].map((task, index) => (
                        <Draggable
                          key={task.$id}
                          draggableId={task.$id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <KanbanCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <Drawer
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelMove();
          }
        }}
        direction="right"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Confirmar movimento</DrawerTitle>
            <DrawerDescription>
              Ajuste as automações antes de aplicar.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 space-y-4">
            <div className="rounded-md border border-muted/40 p-3 text-sm">
              <p className="font-medium">
                {pendingMove?.movedTask.name ?? "Tarefa"}
              </p>
              <p className="text-xs text-muted-foreground">
                {pendingMove?.sourceStatus} → {pendingMove?.destStatus}
              </p>
            </div>

            {pendingMove && !pendingMove.movedTask.assigneeId ? (
              <div
                className={cn(
                  "flex items-start gap-2 rounded-md border border-muted/40 p-3 text-sm",
                  !currentMemberId && "opacity-60"
                )}
              >
                <Checkbox
                  checked={autoAssignEnabled && copilotEnabled}
                  onCheckedChange={(value) =>
                    setAutoAssignEnabled(value === true)
                  }
                  disabled={!currentMemberId || !copilotEnabled}
                />
                <div>
                  <p className="font-medium">Assumir tarefa automaticamente</p>
                  <p className="text-xs text-muted-foreground">
                    Define você como responsável ao mover.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          <DrawerFooter>
            <Button
              onClick={handleConfirmMove}
              disabled={!pendingMove}
            >
              Confirmar movimento
            </Button>
            <Button variant="outline" onClick={handleCancelMove}>
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
