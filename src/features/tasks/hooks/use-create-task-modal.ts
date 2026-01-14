import { useQueryState, parseAsBoolean, parseAsStringLiteral } from "nuqs";
import { TaskStatus } from "../types";

const statusParser = parseAsStringLiteral([
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
] as const);

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-task",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const [status, setStatus] = useQueryState(
    "create-task-status",
    statusParser
      .withDefault(TaskStatus.BACKLOG)
      .withOptions({ clearOnDefault: true })
  );

  const open = (initialStatus?: TaskStatus) => {
    if (initialStatus) setStatus(initialStatus);
    setIsOpen(true);
  };

  const openNoStatus = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    setIsOpen,
    status,
    openNoStatus,
  };
};
