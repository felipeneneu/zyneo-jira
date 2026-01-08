import { snakeCaseToTitleCase } from "@/src/lib/utils";
import { TaskStatus } from "../types";
import {
  CircleCheckBig,
  CircleDotIcon,
  CircleIcon,
  CircleQuestionMark,
  PlusIcon,
  Timer,
} from "lucide-react";
import { Button } from "@/src/ui/button";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";

interface KanbanColumnHeaderProps {
  board: TaskStatus;
  taskCount: number;
  onCreateTask?: (status: TaskStatus) => void;
}

const statusIconMap: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.BACKLOG]: (
    <CircleQuestionMark className="size-4.5 text-pink-400" />
  ),
  [TaskStatus.TODO]: <CircleIcon className="size-4.5 text-red-400" />,
  [TaskStatus.IN_PROGRESS]: <Timer className="size-4.5 text-yellow-400" />,
  [TaskStatus.IN_REVIEW]: <CircleDotIcon className="size-4.5 text-blue-400" />,
  [TaskStatus.DONE]: <CircleCheckBig className="size-4.5 text-emerald-400" />,
};

export const KanbanColumnHeader = ({
  board,
  taskCount,
}: KanbanColumnHeaderProps) => {
  const { open } = useCreateTaskModal();
  const icon = statusIconMap[board];

  return (
    <div className="px-2 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        {icon}
        <h2 className="text-sm font-medium">{snakeCaseToTitleCase(board)}</h2>
        <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 text-xs text-neutral-700 font-medium">
          {taskCount}
        </div>
      </div>
      <Button
        onClick={() => open(board)}
        variant={"ghost"}
        size={"icon"}
        className="size-5 cursor-pointer"
      >
        <PlusIcon className="size-4 text-neutral-500" />
      </Button>
    </div>
  );
};
