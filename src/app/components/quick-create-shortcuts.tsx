"use client";

import { useEffect } from "react";

import { useCreateTaskModal } from "@/src/features/tasks/hooks/use-create-task-modal";
import { useCreateProjectModal } from "@/src/features/projects/hooks/use-create-project-modal";
import { useWorkspaceModal } from "@/src/features/workspaces/hooks/use-workspace-modal";

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
};

export const QuickCreateShortcuts = () => {
  const { open: openTask } = useCreateTaskModal();
  const { open: openProject } = useCreateProjectModal();
  const { open: openWorkspace } = useWorkspaceModal();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const hasModifier = event.ctrlKey || event.metaKey;
      if (!hasModifier || !event.shiftKey) return;

      const key = event.key.toLowerCase();
      if (key === "t") {
        event.preventDefault();
        openTask();
        return;
      }
      if (key === "p") {
        event.preventDefault();
        openProject();
        return;
      }
      if (key === "w") {
        event.preventDefault();
        openWorkspace();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openProject, openTask, openWorkspace]);

  return null;
};
