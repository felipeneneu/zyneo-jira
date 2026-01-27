import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
  endOfWeek,
  addDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./react-big-calendar.css";

import { Task, TaskStatus } from "../types";
import { EventCard } from "./event-card";
import { CustomToolbar } from "./custom-toolbar";
import { Button } from "@/src/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/src/ui/drawer";
import { Input } from "@/src/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/select";
import { DatePicker } from "@/src/ui/date-picker";
import { Checkbox } from "@/src/ui/checkbox";
import { Badge } from "@/src/ui/badge";
import { cn } from "@/src/lib/utils";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { useCreateTask } from "../api/use-create-task";
import { useUpdateTask } from "../api/use-update-task";
import { useBulkSetDueDate } from "../api/use-bulk-set-due-date";
import { getPriority, type TaskPriority } from "../utils/task-flags";

// const locales = {
//   "en-US": enUS
// }

const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  today: "Hoje",
  previous: "Anterior",
  next: "Próximo",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "Nenhuma tarefa neste período",
  showMore: (total: number) => `+${total} mais`,
};

interface DataCalendarProps {
  data: Task[];
}

interface CalendarEvent {
  start: Date;
  end: Date;
  title: string;
  project?: Task["project"];
  assignee?: Task["assignee"];
  status: Task["status"];
  id: string;
  taskKey?: string;
}

interface DueDateSuggestion {
  taskId: string;
  title: string;
  priority: TaskPriority | null;
  suggestedDate: Date;
  reason: string;
}

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);
const CONFLICT_THRESHOLD = 4;
const AUTO_SUGGEST_STORAGE_KEY = "calendar:copilot:due-date";

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

const buildSuggestedDate = (priority: TaskPriority | null) => {
  const today = new Date();
  if (priority === "P1") {
    return addDays(today, 1);
  }
  if (priority === "P2") {
    return addDays(today, 3);
  }
  return addDays(today, 7);
};

export const DataCalendar = ({ data }: DataCalendarProps) => {
  const workspaceId = useWorkspaceId();
  const { data: projects } = useGetProjects({ workspaceId });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const bulkSetDueDate = useBulkSetDueDate();

  const [value, setValue] = useState(() => {
    const firstDate = data.find((task) => task.dueDate)?.dueDate;
    if (!firstDate) return new Date();
    const parsed = new Date(firstDate);
    return isValidDate(parsed) ? parsed : new Date();
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [replanOpen, setReplanOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
  const [replanEvent, setReplanEvent] = useState<CalendarEvent | null>(null);
  const [replanDate, setReplanDate] = useState<Date | null>(null);
  const [replanOriginalDate, setReplanOriginalDate] = useState<Date | null>(null);

  const [taskName, setTaskName] = useState("");
  const [projectId, setProjectId] = useState<string | undefined>();
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);

  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true);
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
    const stored = localStorage.getItem(AUTO_SUGGEST_STORAGE_KEY);
    if (stored === "true" || stored === "false") {
      setAutoSuggestEnabled(stored === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      AUTO_SUGGEST_STORAGE_KEY,
      String(autoSuggestEnabled)
    );
  }, [autoSuggestEnabled]);

  useEffect(() => {
    if (!projectId && projectOptions.length === 1) {
      setProjectId(projectOptions[0].id);
    }
  }, [projectId, projectOptions]);

  const events = useMemo<CalendarEvent[]>(
    () =>
      data.flatMap((task) => {
        if (!task.dueDate) return [];
        const dueDate = new Date(task.dueDate);
        if (!isValidDate(dueDate)) return [];
        return [
          {
            start: dueDate,
            end: dueDate,
            title: task.name,
            project: task.project,
            assignee: task.assignee,
            status: task.status,
            id: task.$id,
            taskKey: task.taskKey,
          },
        ];
      }),
    [data]
  );

  const suggestions = useMemo<DueDateSuggestion[]>(() => {
    if (!autoSuggestEnabled) return [];
    return data
      .filter((task) => {
        if (!task.dueDate) return true;
        const parsed = new Date(task.dueDate);
        return !isValidDate(parsed);
      })
      .map((task) => {
        const priority = getPriority(task.flags);
        const suggestedDate = buildSuggestedDate(priority);
        return {
          taskId: task.$id,
          title: task.name,
          priority,
          suggestedDate,
          reason: priority
            ? `Prioridade ${priority} sem prazo`
            : "Sem prazo definido",
        };
      });
  }, [autoSuggestEnabled, data]);

  useEffect(() => {
    setSelectedSuggestions(new Set(suggestions.map((item) => item.taskId)));
  }, [suggestions]);

  const weeklyLoad = useMemo(() => {
    const weekStart = startOfWeek(value, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(value, { weekStartsOn: 1 });
    const counts = new Map<string, number>();
    let total = 0;

    for (const event of events) {
      if (event.start < weekStart || event.start > weekEnd) continue;
      const key = format(event.start, "yyyy-MM-dd");
      counts.set(key, (counts.get(key) ?? 0) + 1);
      total += 1;
    }

    const conflictDays = Array.from(counts.values()).filter(
      (count) => count >= CONFLICT_THRESHOLD
    ).length;

    return { total, conflictDays };
  }, [events, value]);

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValue(subMonths(value, 1));
    } else if (action === "NEXT") {
      setValue(addMonths(value, 1));
    } else if (action === "TODAY") {
      setValue(new Date());
    }
  };

  const openCreateDrawer = (date: Date) => {
    setSelectedSlotDate(date);
    setCreateOpen(true);
  };

  const openReplanDrawer = (event: CalendarEvent, date: Date) => {
    setReplanEvent(event);
    setReplanOriginalDate(event.start);
    setReplanDate(date);
    setReplanOpen(true);
  };

  const handleCreateTask = async () => {
    if (!workspaceId || !projectId || !selectedSlotDate || !taskName.trim()) {
      return;
    }

    await createTask.mutateAsync({
      json: {
        name: taskName.trim(),
        status,
        workspaceId,
        projectId,
        dueDate: selectedSlotDate,
      },
    });

    setTaskName("");
    setCreateOpen(false);
  };

  const handleReplanTask = async () => {
    if (!replanEvent || !replanDate) return;
    await updateTask.mutateAsync({
      param: { taskId: replanEvent.id },
      json: { dueDate: replanDate },
    });
    setReplanOpen(false);
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

  const applySuggestions = async () => {
    const updates = suggestions
      .filter((item) => selectedSuggestions.has(item.taskId))
      .map((item) => ({
        taskId: item.taskId,
        dueDate: item.suggestedDate,
      }));

    if (updates.length === 0) {
      setSuggestOpen(false);
      return;
    }

    const result = await bulkSetDueDate.mutateAsync({ updates });
    if (result.successCount > 0) {
      setSuggestOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Semana atual: {weeklyLoad.total} tarefas</span>
          {weeklyLoad.conflictDays > 0 ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
              {weeklyLoad.conflictDays} dia(s) com sobrecarga
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSuggestOpen(true)}
            disabled={suggestions.length === 0}
          >
            Copiloto: sugerir prazos
          </Button>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={autoSuggestEnabled}
              onCheckedChange={(value) =>
                setAutoSuggestEnabled(value === true)
              }
            />
            Copiloto ativo
          </label>
        </div>
      </div>

      <DnDCalendar
        localizer={localizer}
        date={value}
        events={events}
        views={["month"]}
        defaultView="month"
        toolbar
        showAllEvents
        selectable
        draggableAccessor={() => true}
        className="h-full"
        max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
        formats={{
          weekdayFormat: (date, culture, localizer) =>
            localizer?.format(date, "EEE", culture) ?? "",
        }}
        culture="pt-BR"
        messages={messages}
        components={{
          eventWrapper: ({ event }) => (
            <EventCard
              id={event.id}
              title={event.title}
              assignee={event.assignee}
              project={event.project}
              status={event.status}
            />
          ),
          toolbar: () => (
            <CustomToolbar date={value} onNavigate={handleNavigate} />
          ),
        }}
        onSelectSlot={({ start }) => openCreateDrawer(start as Date)}
        onSelectEvent={(event) =>
          openReplanDrawer(event as CalendarEvent, event.start as Date)
        }
        onEventDrop={({ event, start }) =>
          openReplanDrawer(event as CalendarEvent, start as Date)
        }
      />

      <Drawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        direction="right"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Criar tarefa no calendário</DrawerTitle>
            <DrawerDescription>
              Confirme o conteúdo antes de criar.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={taskName}
                onChange={(event) => setTaskName(event.target.value)}
                placeholder="Digite o nome da tarefa"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Projeto</label>
              <Select value={projectId} onValueChange={setProjectId}>
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
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as TaskStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                    <SelectItem value={TaskStatus.TODO}>A fazer</SelectItem>
                    <SelectItem value={TaskStatus.READY}>Pronto</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                      Em andamento
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <DatePicker
                  value={selectedSlotDate ?? undefined}
                  onChange={(date) => setSelectedSlotDate(date)}
                  placeholder="Selecionar data"
                  className="h-10"
                />
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleCreateTask}
              disabled={
                !workspaceId ||
                !projectId ||
                !selectedSlotDate ||
                !taskName.trim() ||
                createTask.isPending
              }
            >
              Criar tarefa
            </Button>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={replanOpen}
        onOpenChange={setReplanOpen}
        direction="right"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Replanejar tarefa</DrawerTitle>
            <DrawerDescription>
              Confirme a nova data antes de salvar.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 space-y-3">
            <div className="rounded-md border border-muted/40 p-3 text-sm">
              <p className="font-medium">{replanEvent?.title ?? "Tarefa"}</p>
              <p className="text-xs text-muted-foreground">
                De:{" "}
                {replanOriginalDate
                  ? format(replanOriginalDate, "dd/MM/yyyy")
                  : "--"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nova data</label>
              <DatePicker
                value={replanDate ?? undefined}
                onChange={(date) => setReplanDate(date)}
                placeholder="Selecionar data"
                className="h-10"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={handleReplanTask}
              disabled={!replanEvent || !replanDate || updateTask.isPending}
            >
              Confirmar replanejamento
            </Button>
            <Button variant="outline" onClick={() => setReplanOpen(false)}>
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={suggestOpen}
        onOpenChange={setSuggestOpen}
        direction="right"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Sugerir prazos</DrawerTitle>
            <DrawerDescription>
              Confirme as sugestões do copiloto.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={selectedSuggestions.size === suggestions.length}
                  onCheckedChange={(value) =>
                    toggleAllSuggestions(value === true)
                  }
                />
                Selecionar tudo
              </label>
              <span>
                {selectedSuggestions.size} de {suggestions.length}
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
                    <Badge>{format(item.suggestedDate, "dd/MM")}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
          <DrawerFooter>
            <Button
              onClick={applySuggestions}
              disabled={
                selectedSuggestions.size === 0 || bulkSetDueDate.isPending
              }
            >
              Aplicar prazos sugeridos
            </Button>
            <Button variant="outline" onClick={() => setSuggestOpen(false)}>
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
