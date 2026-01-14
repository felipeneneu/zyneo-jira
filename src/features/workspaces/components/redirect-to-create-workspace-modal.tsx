"use client";

import { useEffect } from "react";
import { useWorkspaceModal } from "../hooks/use-workspace-modal";

export const RedirectToCreateWorkspaceModal = () => {
  const { open, isOpen } = useWorkspaceModal();

  useEffect(() => {
    if (!isOpen) {
      open();
    }
  }, []);

  return null;
};
