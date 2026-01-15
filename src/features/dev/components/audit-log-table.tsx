"use client";

import { ScrollArea } from "@/src/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/ui/table";
import { Badge } from "@/src/ui/badge";

type AuditLogItem = {
  id: string;
  action: string;
  entity: string;
  actor: string;
  at: string;
};

const defaultItems: AuditLogItem[] = [
  {
    id: "1",
    action: "TASK_MOVED",
    entity: "Feature: Auth",
    actor: "Ana",
    at: "2h ago",
  },
  {
    id: "2",
    action: "TASK_UPDATED",
    entity: "Bug: Login",
    actor: "Bruno",
    at: "5h ago",
  },
  {
    id: "3",
    action: "SPRINT_STARTED",
    entity: "Sprint 12",
    actor: "Carla",
    at: "1d ago",
  },
  {
    id: "4",
    action: "DEPLOYED",
    entity: "Release 1.8.3",
    actor: "DevOps",
    at: "2d ago",
  },
];

interface AuditLogTableProps {
  items?: AuditLogItem[];
}

export const AuditLogTable = ({ items = defaultItems }: AuditLogTableProps) => {
  return (
    <ScrollArea className="max-h-[420px] rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Badge variant="secondary">{item.action}</Badge>
              </TableCell>
              <TableCell className="font-medium">{item.entity}</TableCell>
              <TableCell>{item.actor}</TableCell>
              <TableCell>{item.at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
