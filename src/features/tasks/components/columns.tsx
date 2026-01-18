"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task } from "../types";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { Button } from "@/src/ui/button";
import { ProjectAvatar } from "../../projects/components/project-avatar";
import { MembersAvatar } from "../../members/components/members-avatar";
import { TaskDate } from "./task-date";
import { Badge } from "@/src/ui/badge";
import { snakeCaseToTitleCase } from "@/src/lib/utils";
import { TaskActions } from "./task-actions";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome da tarefa
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.name;
      const taskKey = row.original.taskKey;

      return (
        <div className="flex flex-col gap-0.5">
          {taskKey ? (
            <span className="text-xs text-muted-foreground">{taskKey}</span>
          ) : null}
          <p className="line-clamp-1">{name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "project",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Projeto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const project = row.original.project;
      if (!project) {
        return <p className="text-muted-foreground">—</p>;
      }

      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <ProjectAvatar
            className="size-6"
            name={project.name}
            image={project.imageUrl}
          />
          <p className="line-clamp-1">{project.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Responsável
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      if (!assignee) {
        return <p className="text-muted-foreground">—</p>;
      }

      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <MembersAvatar
            className="size-6"
            fallbackClassName="text-xs"
            name={assignee.name}
          />
          <p className="line-clamp-1">{assignee.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data de vencimento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;

      return <TaskDate value={dueDate} />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;

      return <Badge variant={status}>{snakeCaseToTitleCase(status)}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.$id;
      const projectId = row.original.projectId;
      const taskKey = row.original.taskKey;

      return (
        <TaskActions id={id} projectId={projectId} taskKey={taskKey}>
          <Button variant={"ghost"} className="size-8 p-0">
            <MoreVertical />
          </Button>
        </TaskActions>
      );
    },
  },
];
