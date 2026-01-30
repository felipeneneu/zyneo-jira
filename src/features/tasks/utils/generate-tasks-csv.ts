import Papa from "papaparse";

import type { Task } from "../types";
import { getPriority } from "./task-flags";

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
};

export const generateTasksCsv = (tasks: Task[]) => {
  const rows = tasks.map((task) => ({
    Título: task.taskKey ? `${task.taskKey} - ${task.name}` : task.name,
    Status: task.status,
    Prazo: formatDate(task.dueDate),
    Conclusão: task.completedAt ? formatDate(task.completedAt) : "",
    Responsável: task.assignee?.name ?? "",
    Prioridade: getPriority(task.flags) ?? "",
  }));

  const csv = Papa.unparse(rows, {
    delimiter: ";",
    quotes: true,
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-tarefas-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
