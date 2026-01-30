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
import { DatePicker } from "@/src/ui/date-picker";
import { ScrollArea, ScrollBar } from "@/src/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/ui/select";
import { MembersAvatar } from "../../members/components/members-avatar";
import { Task } from "../types";
import { ProjectAvatar } from "../../projects/components/project-avatar";
import { useUpdateTask } from "../api/use-update-task";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useGetWorkspace } from "../../workspaces/api/use-get-workspace-id";
import { getWorkspaceStatuses } from "../utils/task-statuses";
import { TASK_STATUS_LABELS } from "../utils/task-status-labels";
import { getPriority } from "../utils/task-flags";

interface EditTaskFormProps {
  onCancel?: () => void;
  projectOptions: { id: string; name: string; imageUrl: string }[];
  memberOptions: { id: string; name: string; avatarUrl?: string | null }[];
  initialValues: Task;
}

const editTaskFormSchema = createTaskSchema.omit({
  workspaceId: true,
  description: true,
});

type EditTaskFormValues = z.infer<typeof editTaskFormSchema>;

export const EditTaskForm = ({
  onCancel,
  projectOptions,
  memberOptions,
  initialValues,
}: EditTaskFormProps) => {
  const { mutate, isPending } = useUpdateTask();
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ workspaceId });
  const statuses = getWorkspaceStatuses(workspace?.workspaceType);

  const defaultValues: EditTaskFormValues = {
    name: initialValues.name,
    status: initialValues.status,
    assigneeId: initialValues.assigneeId,
    projectId: initialValues.projectId,
    dueDate: initialValues.dueDate
      ? new Date(initialValues.dueDate)
      : new Date(),
    priority: getPriority(initialValues.flags) ?? undefined,
    documentation: initialValues.documentation ?? undefined,
    diagramUrl: initialValues.diagramUrl ?? undefined,
    githubPrs: initialValues.githubPrs ?? undefined,
    completedAt: initialValues.completedAt
      ? new Date(initialValues.completedAt)
      : undefined,
  };

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues,
  });
  const onSubmit = (values: EditTaskFormValues) => {
    mutate(
      { json: values, param: { taskId: initialValues.$id } },
      {
        onSuccess: () => {
          form.reset();
          onCancel?.();
        },
      }
    );
  };

  return (
    <Card className="w-full max-h-[85vh] border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Edit a task</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7 flex flex-col min-h-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-col"
          >
            <ScrollArea className="flex-1 min-h-0 pr-2">
              <div className="flex flex-col gap-y-4 w-full">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter task name" />
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
                      <FormLabel>Due Date</FormLabel>
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
                      <FormLabel>Assignee</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select assignee" />
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
                      <FormLabel>Priority</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent
                          side="bottom"
                          align="start"
                          sideOffset={2}
                          position="popper"
                        >
                          <SelectItem value="P1">P1 - High</SelectItem>
                          <SelectItem value="P2">P2 - Medium</SelectItem>
                          <SelectItem value="P3">P3 - Low</SelectItem>
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
                      <FormLabel>Project</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select project" />
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
              <ScrollBar orientation="vertical" />
            </ScrollArea>
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
                Cancel
              </Button>
              <Button type="submit" size={"lg"} disabled={isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
