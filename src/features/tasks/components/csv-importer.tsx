"use client";

import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/ui/button";
import { useBulkCreateTasks } from "../api/use-bulk-create-tasks";
import { TaskStatus } from "../types";
import { useGetMembers } from "../../members/api/use-get-members";
import type { Member } from "../../members/types";

type CsvRow = {
  Título?: string;
  Descrição?: string;
  Prazo?: string;
  Prioridade?: string;
  Responsável?: string;
};

interface CsvImporterProps {
  workspaceId?: string;
  projectId?: string;
  defaultStatus?: TaskStatus;
}

const normalize = (value: string) => value.trim().toLowerCase();

const mapPriority = (value?: string): "P1" | "P2" | "P3" | undefined => {
  if (!value) return undefined;
  const normalized = normalize(value);
  if (normalized === "p1" || normalized === "alta") return "P1";
  if (normalized === "p2" || normalized === "media" || normalized === "média")
    return "P2";
  if (normalized === "p3" || normalized === "baixa") return "P3";
  return undefined;
};

const parseDate = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
};

const resolveAssigneeId = (value: string, members: Member[] | undefined) => {
  if (!value || !members) return undefined;
  const normalized = normalize(value);
  const found = members.find((member) => {
    const name = normalize(member.name ?? "");
    const email = normalize(member.email ?? "");
    return name === normalized || email === normalized;
  });
  return found?.$id;
};

export const CsvImporter = ({
  workspaceId,
  projectId,
  defaultStatus = TaskStatus.BACKLOG,
}: CsvImporterProps) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { data: members } = useGetMembers({
    workspaceId: workspaceId ?? "",
    enabled: !!workspaceId,
  });
  const bulkCreate = useBulkCreateTasks();

  const membersList = useMemo(() => members?.documents ?? [], [members?.documents]);

  const handleFilePick = () => {
    if (!workspaceId) {
      toast.error("Workspace não encontrado.");
      return;
    }
    if (!projectId) {
      toast.error("Selecione um projeto antes de importar.");
      return;
    }
    fileRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!workspaceId || !projectId) {
      toast.error("Workspace ou projeto ausente.");
      return;
    }

    setIsImporting(true);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data.filter((row) => row["Título"]);
          if (rows.length === 0) {
            toast.error("Nenhuma linha válida encontrada.");
            return;
          }

          const tasksToCreate = rows.map((row) => {
            const assigneeId = row["Responsável"]
              ? resolveAssigneeId(row["Responsável"], membersList)
              : undefined;
            const dueDate = parseDate(row["Prazo"]) ?? new Date();
            const priority = mapPriority(row["Prioridade"]);
            return {
              name: row["Título"]?.trim() ?? "",
              description: row["Descrição"]?.trim() ?? undefined,
              dueDate,
              priority,
              status: defaultStatus,
              workspaceId,
              projectId,
              assigneeId,
            };
          });

          const result = await bulkCreate.mutateAsync({
            json: { tasks: tasksToCreate },
          });

          if (result.successCount > 0) {
            toast.success(`${result.successCount} tarefa(s) importada(s).`);
          }
          if (result.failureCount > 0) {
            toast.error(`${result.failureCount} tarefa(s) falharam na importação.`);
          }
        } catch (error) {
          toast.error("Falha ao importar CSV.");
        } finally {
          setIsImporting(false);
          if (fileRef.current) fileRef.current.value = "";
        }
      },
      error: () => {
        toast.error("Não foi possível ler o arquivo CSV.");
        setIsImporting(false);
      },
    });
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        size="sm"
        variant="secondary"
        className="gap-2"
        onClick={handleFilePick}
        disabled={isImporting}
      >
        <UploadCloud className="size-4" />
        {isImporting ? "Importando..." : "Importar CSV"}
      </Button>
    </>
  );
};
