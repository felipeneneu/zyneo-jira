"use client";
import { useRouter } from "next/navigation";

import { useWorkspaceModal } from "../hooks/use-workspace-modal";
import { WorkspaceWizard } from "./onboarding/workspace-wizard";
import type { WorkspaceOnboardingState } from "./onboarding/types";
import { useCreateWorkspace } from "../api/use-create-workspace";

export const CreateWorkspaceModal = () => {
  const { isOpen, setIsOpen, close } = useWorkspaceModal();
  const router = useRouter();
  const { mutate, isPending } = useCreateWorkspace();

  const handleComplete = (data: WorkspaceOnboardingState) => {
    const form: Record<string, unknown> = {
      name: data.name.trim(),
    };

    if (data.image instanceof File) {
      form.image = data.image;
    }
    if (data.type) {
      form.workspaceType = data.type;
    }
    if (data.description?.trim()) {
      form.description = data.description.trim();
    }

    mutate(
      { form: form as any },
      {
        onSuccess: ({ data }) => {
          close();
          const slugOrId = data.slug ?? data.$id;
          router.push(`/workspaces/${slugOrId}`);
        },
      }
    );
  };

  return (
    <WorkspaceWizard
      open={isOpen}
      onOpenChange={setIsOpen}
      onComplete={handleComplete}
      isPending={isPending}
    />
  );
};
