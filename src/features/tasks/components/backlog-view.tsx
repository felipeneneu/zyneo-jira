"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ListChecks, Sparkles } from "lucide-react";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/src/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/src/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/select";
import { DatePicker } from "@/src/ui/date-picker";
import { Textarea } from "@/src/ui/textarea";
import { Checkbox } from "@/src/ui/checkbox";
import { Badge } from "@/src/ui/badge";
import { cn } from "@/src/lib/utils";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { useBulkCreateTasks } from "../api/use-bulk-create-tasks";
import { useBulkSetPriority } from "../api/use-bulk-set-priority";
import { TaskStatus, type Task } from "../types";
import { getPriority, type TaskPriority } from "../utils/task-flags";

interface BacklogViewProps {
  tasks: Task[];
}

interface PrioritySuggestion {
  taskId: string;
  title: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  reason: string;
}

const AUTO_PRIORITY_STORAGE_KEY = "backlog:copilot:auto-priority";
const DEFAULT_AUTO_PRIORITY_ENABLED = true;

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  P1: "P1 - Alta",
  P2: "P2 - Média",
  P3: "P3 - Baixa",
};

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const toStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const diffInDays = (from: Date, to: Date) =>
  Math.ceil((to.getTime() - from.getTime()) / MS_IN_DAY);

const hasUrgentKeyword = (title: string) =>
  /(bug|crash|urgent|bloquead|incidente)/i.test(title);

const buildPrioritySuggestion = (task: Task): PrioritySuggestion | null => {
  if (getPriority(task.flags)) return null;
  if (task.status === TaskStatus.DONE) return null;

  const today = toStartOfDay(new Date());
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const title = task.name;

  if (hasUrgentKeyword(title)) {
    return {
      taskId: task.$id,
      title,
      dueDate: task.dueDate,
      status: task.status,
      priority: "P1",
      reason: "Título sugere urgência",
    };
  }

  if (dueDate) {
    const daysToDue = diffInDays(today, toStartOfDay(dueDate));
    if (daysToDue <= 1) {
      return {
        taskId: task.$id,
        title,
        dueDate: task.dueDate,
        status: task.status,
        priority: "P1",
        reason: "Prazo muito próximo",
      };
    }
    if (daysToDue <= 7) {
      return {
        taskId: task.$id,
        title,
        dueDate: task.dueDate,
        status: task.status,
        priority: "P2",
        reason: "Prazo nesta semana",
      };
    }
  }

  return {
    taskId: task.$id,
    title,
    dueDate: task.dueDate,
    status: task.status,
    priority: "P3",
    reason: "Backlog sem prioridade definida",
  };
};

const isBacklogCandidate = (task: Task) =>
  task.status === TaskStatus.BACKLOG || task.status === TaskStatus.TODO;

export const BacklogView = ({ tasks }: BacklogViewProps) => {
  const workspaceId = useWorkspaceId();
  const { data: projects } = useGetProjects({ workspaceId });
  const bulkCreate = useBulkCreateTasks();
  const bulkSetPriority = useBulkSetPriority();

  const [autoPriorityEnabled, setAutoPriorityEnabled] = useState(
    DEFAULT_AUTO_PRIORITY_ENABLED
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkProjectId, setBulkProjectId] = useState<string | undefined>();
  const [bulkStatus, setBulkStatus] = useState<TaskStatus>(TaskStatus.BACKLOG);
  const [bulkDueDate, setBulkDueDate] = useState<Date>(new Date());
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
    new Set()
  );

  const projectOptions = useMemo(
    () =>
      projects?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
      })) ?? [],
    [projects?.documents]
  );

  useEffect(() => {
    const stored = localStorage.getItem(AUTO_PRIORITY_STORAGE_KEY);
    if (stored === "true" || stored === "false") {
      setAutoPriorityEnabled(stored === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      AUTO_PRIORITY_STORAGE_KEY,
      String(autoPriorityEnabled)
    );
  }, [autoPriorityEnabled]);

  useEffect(() => {
    if (!bulkProjectId && projectOptions.length === 1) {
      setBulkProjectId(projectOptions[0].id);
    }
  }, [bulkProjectId, projectOptions]);

  const bulkLines = useMemo(
    () =>
      bulkText
        .split("\n")
        .map((line) => line.trim().replace(/^[-*]\s+/, ""))
        .filter(Boolean),
    [bulkText]
  );

  const suggestions = useMemo(() => {
    if (!autoPriorityEnabled) {
      return [];
    }
    return tasks
      .filter(isBacklogCandidate)
      .map(buildPrioritySuggestion)
      .filter((item): item is PrioritySuggestion => item !== null);
  }, [autoPriorityEnabled, tasks]);

  useEffect(() => {
    const nextSelection = new Set(suggestions.map((item) => item.taskId));
    setSelectedSuggestions(nextSelection);
  }, [suggestions]);

  const pendingSuggestionsCount = suggestions.length;

  const canCreate =
    bulkLines.length > 0 && bulkProjectId && bulkDueDate && workspaceId;

  const handleBulkCreate = async () => {
    if (!workspaceId || !bulkProjectId || !bulkDueDate) {
      return;
    }

    const tasksToCreate = bulkLines.map((name) => ({
      name,
      status: bulkStatus,
      workspaceId,
      projectId: bulkProjectId,
      dueDate: bulkDueDate,
    }));

    const result = await bulkCreate.mutateAsync({ tasks: tasksToCreate });
    if (result.successCount > 0) {
      setBulkText("");
      setIsCreateOpen(false);
    }
  };

  const handleApplySuggestions = async () => {
    const updates = suggestions
      .filter((item) => selectedSuggestions.has(item.taskId))
      .map((item) => ({
        taskId: item.taskId,
        priority: item.priority,
      }));

    if (updates.length === 0) {
      setIsSuggestOpen(false);
      return;
    }

    const result = await bulkSetPriority.mutateAsync({ updates });
    if (result.successCount > 0) {
      setIsSuggestOpen(false);
    }
  };

  const toggleSuggestion = (taskId: string) => {
    setSelectedSuggestions((current) => {
      const next = new Set(current);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const toggleAllSuggestions = (checked: boolean) => {
    if (!checked) {
      setSelectedSuggestions(new Set());
      return;
    }
    setSelectedSuggestions(new Set(suggestions.map((item) => item.taskId)));
  };

  const selectedCount = selectedSuggestions.size;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <ListChecks className="size-4" />
            Criar em lote
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            onClick={() => setIsSuggestOpen(true)}
            disabled={pendingSuggestionsCount === 0}
          >
            <Sparkles className="size-4" />
            Sugestões de prioridade
            {pendingSuggestionsCount > 0 ? (
              <Badge className="ml-2">{pendingSuggestionsCount}</Badge>
            ) : null}
          </Button>
          <div className="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/30 px-3 py-1.5 text-xs text-muted-foreground">
            <Checkbox
              checked={autoPriorityEnabled}
              onCheckedChange={(value) =>
                setAutoPriorityEnabled(value === true)
              }
            />
            Copiloto ativo
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          Sem prioridade:{" "}
          {tasks.filter((task) => !getPriority(task.flags)).length}
        </span>
      </div>

      <DataTable columns={columns} data={tasks} />

      <Drawer
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        direction="right"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Criar tarefas em lote</DrawerTitle>
            <DrawerDescription>
              Uma linha por tarefa. O responsável será você (padrão do
              workspace).
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Projeto</label>
              <Select
                value={bulkProjectId}
                onValueChange={setBulkProjectId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status inicial</label>
                <Select
                  value={bulkStatus}
                  onValueChange={(value) =>
                    setBulkStatus(value as TaskStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                    <SelectItem value={TaskStatus.TODO}>A fazer</SelectItem>
                    <SelectItem value={TaskStatus.READY}>Pronto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de vencimento</label>
                <DatePicker
                  value={bulkDueDate}
                  onChange={setBulkDueDate}
                  placeholder="Selecionar data"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tarefas</label>
              <Textarea
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
                placeholder={"Ex:\n- Revisar backlog\n- Definir escopo\n- Ajustar prioridades"}
                className="min-h-[180px]"
              />
              <p className="text-xs text-muted-foreground">
                {bulkLines.length} tarefa(s) pronta(s) para criar
              </p>
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleBulkCreate}
              disabled={!canCreate || bulkCreate.isPending}
              className="gap-2"
            >
              <Calendar className="size-4" />
              Criar tarefas
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isSuggestOpen}
        onOpenChange={setIsSuggestOpen}
        direction="right"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Aplicar prioridades sugeridas</DrawerTitle>
            <DrawerDescription>
              Confirme as sugestões do copiloto antes de aplicar.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCount === pendingSuggestionsCount}
                  onCheckedChange={(value) =>
                    toggleAllSuggestions(value === true)
                  }
                />
                Selecionar tudo
              </label>
              <span>
                {selectedCount} de {pendingSuggestionsCount} selecionadas
              </span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-auto rounded-md border border-muted/40">
              {suggestions.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Nada para sugerir agora.
                </div>
              ) : (
                suggestions.map((item) => (
                  <div
                    key={item.taskId}
                    className={cn(
                      "flex items-start gap-3 border-b border-muted/30 p-3 last:border-b-0",
                      selectedSuggestions.has(item.taskId) && "bg-muted/40"
                    )}
                  >
                    <Checkbox
                      checked={selectedSuggestions.has(item.taskId)}
                      onCheckedChange={() => toggleSuggestion(item.taskId)}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.reason}
                      </p>
                    </div>
                    <Badge>{PRIORITY_LABELS[item.priority]}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleApplySuggestions}
              disabled={selectedCount === 0 || bulkSetPriority.isPending}
            >
              Aplicar prioridades
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSuggestOpen(false)}
            >
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
