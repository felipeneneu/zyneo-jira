"use client";

import { useEffect, useState } from "react";
import { useGetWorkspaces } from "@/src/features/workspaces/api/use-get-workspaces";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import { useWorkspaceModal } from "@/src/features/workspaces/hooks/use-workspace-modal";
import { RiAddCircleFill } from "react-icons/ri";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { WorkspaceAvatar } from "@/src/features/workspaces/components/workspace-avatar";

export const WorkspaceSwitcher = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: workspaces } = useGetWorkspaces();
  const [lastWorkspaceId, setLastWorkspaceId] = useState<string | undefined>();

  const { open } = useWorkspaceModal();

  const onSelect = (idOrSlug: string) => {
    localStorage.setItem("workspace:last-selected", idOrSlug);
    setLastWorkspaceId(idOrSlug);
    router.push(`/workspaces/${idOrSlug}`);
  };

  useEffect(() => {
    if (workspaceId) {
      localStorage.setItem("workspace:last-selected", workspaceId);
      setLastWorkspaceId(workspaceId);
      return;
    }
    if (!lastWorkspaceId) {
      const stored = localStorage.getItem("workspace:last-selected");
      if (stored) {
        setLastWorkspaceId(stored);
      }
    }
  }, [lastWorkspaceId, workspaceId]);

  const currentValue =
    workspaceId ?? lastWorkspaceId ?? workspaces?.documents?.[0]?.$id;
  return (
    <div className="flex flex-col">
      <div className=" flex items-center justify-between mb-2">
        <p className="text-xs uppercase text-neutral-500">Workspaces</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>
      <Select onValueChange={onSelect} value={currentValue}>
        <SelectTrigger className="w-full bg-neutral-200 font-medium p-1 py-6">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent
          side="bottom"
          align="start"
          sideOffset={8}
          position="popper"
        >
          {workspaces?.documents.map((workspace) => {
            const slugOrId = workspace.slug ?? workspace.$id;
            return (
            <SelectItem key={workspace.$id} value={slugOrId}>
              <div className="flex justify-start items-center gap-3 font-medium">
                <WorkspaceAvatar
                  name={workspace.name}
                  image={workspace.imageUrl}
                />
                <span className="truncate">{workspace.name}</span>
              </div>
            </SelectItem>
          )})}
        </SelectContent>
      </Select>
    </div>
  );
};
