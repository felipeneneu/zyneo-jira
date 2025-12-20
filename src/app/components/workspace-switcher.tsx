"use client";

import { useGetWorkspaces } from "@/src/features/workspaces/api/use-get-workspaces";
import { RiAddCircleFill } from "react-icons/ri";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { WorkspaceAvatar } from "@/src/features/workspaces/components/workspace-avatar";

export const WorkspaceSwitcher = () => {
  const { data: workspaces } = useGetWorkspaces();
  return (
    <div className="flex flex-col">
      <div className=" flex items-center justify-between mb-2">
        <p className="text-xs uppercase text-neutral-500">Workspaces</p>
        <RiAddCircleFill className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
      </div>
      <Select>
        <SelectTrigger className="w-full bg-neutral-200 font-medium p-1 py-6">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent
          side="bottom"
          align="start"
          sideOffset={8}
          position="popper"
        >
          {workspaces?.documents.map((workspace) => (
            <SelectItem key={workspace.$id} value={workspace.$id}>
              <div className="flex justify-start items-center gap-3 font-medium">
                <WorkspaceAvatar
                  name={workspace.name}
                  image={workspace.imageUrl}
                />
                <span className="truncate">{workspace.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
