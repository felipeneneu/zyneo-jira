"use client";
import z from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createTaskSchema } from "../schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/ui/form";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { Input } from "@/src/ui/input";
import { Button } from "@/src/ui/button";
import { cn } from "@/src/lib/utils";
import { useCreateTask } from "../api/use-create-task";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/src/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/ui/select";
import { MembersAvatar } from "../../members/components/members-avatar";
import { TaskStatus } from "../types";
import { ProjectAvatar } from "../../projects/components/project-avatar";
import { TASK_STATUS_LABELS } from "../utils/task-status-labels";
import { getWorkspaceStatuses } from "../utils/task-statuses";
import { useGetWorkspace } from "../../workspaces/api/use-get-workspace-id";

interface CreateTaskFormProps {
  onCancel?: () => void;
  projectOptions: { id: string; name: string; imageUrl: string }[];
  memberOptions: { id: string; name: string; avatarUrl?: string | null }[];
  status?: TaskStatus;
  defaultAssigneeId?: string;
}

const createTaskFormSchema = createTaskSchema.omit({ workspaceId: true });

type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;

export const CreateTaskForm = ({
  onCancel,
  projectOptions,
  memberOptions,
  status,
  defaultAssigneeId,
}: CreateTaskFormProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateTask();
  const { data: workspace } = useGetWorkspace({ workspaceId });
  const statuses = getWorkspaceStatuses(workspace?.workspaceType);

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      status,
      assigneeId: defaultAssigneeId,
    },
  });
  const onSubmit = (values: CreateTaskFormValues) => {
    mutate(
      { json: { ...values, workspaceId } },
      {
        onSuccess: () => {
          form.reset();
          onCancel?.();
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Criar uma nova tarefa
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4 w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Tarefa</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o nome da tarefa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <DatePicker {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent
                        side="bottom"
                        align="start"
                        sideOffset={2}
                        position="popper"
                      >
                        {memberOptions.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-x-2">
                              <MembersAvatar
                                className="size-6"
                                name={member.name}
                                avatarUrl={member.avatarUrl}
                              />
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent
                        side="bottom"
                        align="start"
                        sideOffset={2}
                        position="popper"
                      >
                        <SelectItem value="P1">P1 - Alta</SelectItem>
                        <SelectItem value="P2">P2 - Média</SelectItem>
                        <SelectItem value="P3">P3 - Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent
                        side="bottom"
                        align="start"
                        sideOffset={2}
                        position="popper"
                      >
                        {statuses.map((statusValue) => (
                          <SelectItem key={statusValue} value={statusValue}>
                            {TASK_STATUS_LABELS[statusValue]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o projeto" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent
                        side="bottom"
                        align="start"
                        sideOffset={2}
                        position="popper"
                      >
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-x-2">
                              <ProjectAvatar
                                className="size-6"
                                name={project.name}
                                image={project.imageUrl}
                              />
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant={"secondary"}
                onClick={onCancel}
                size={"lg"}
                disabled={isPending}
                className={cn(!onCancel && "invisible")}
              >
                Cancelar
              </Button>
              <Button type="submit" size={"lg"} disabled={isPending}>
                Criar Tarefa
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
