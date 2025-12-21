"use client";
import { ResponsiveModal } from "@/src/app/components/responsive-modal";

import { CreateWorkspaceForm } from "./create-workspace-form";
import { useWorkspaceModal } from "../hooks/use-workspace-modal";

export const CreateWorkspaceModal = () => {
  const { isOpen, setIsOpen, close } = useWorkspaceModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateWorkspaceForm onCancel={close} />
    </ResponsiveModal>
  );
};
