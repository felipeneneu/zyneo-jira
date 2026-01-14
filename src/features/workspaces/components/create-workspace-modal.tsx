"use client";
import { useRouter } from "next/navigation";

import { useWorkspaceModal } from "../hooks/use-workspace-modal";
import { WorkspaceWizard } from "./onboarding/workspace-wizard";
import type { WorkspaceOnboardingState } from "./onboarding/types";
import { useCreateWorkspace } from "../api/use-create-workspace";

export const CreateWorkspaceModal = () => {
  const { isOpen, setIsOpen, close } = useWorkspaceModal();
  const router = useRouter();
  const { mutate } = useCreateWorkspace();

  const handleComplete = (data: WorkspaceOnboardingState) => {
    const form: Record<string, unknown> = {
      name: data.name.trim(),
      teamSize: data.teamSize,
      workflowStyle: data.workflowStyle,
      mainGoal: data.mainGoal,
    };

    if (data.image instanceof File) {
      form.image = data.image;
    }
    if (data.purpose) {
      form.purpose = data.purpose;
    }
    if (data.type) {
      form.workspaceType = data.type;
    }
    if (data.tools?.length) {
      form.tools = JSON.stringify(data.tools);
    }

    mutate(
      { form: form as any },
      {
        onSuccess: ({ data: workspace }) => {
          close();
          router.push(`/workspaces/${workspace.$id}`);
        },
      }
    );
  };

  return (
    <WorkspaceWizard
      open={isOpen}
      onOpenChange={setIsOpen}
      onComplete={handleComplete}
    />
  );
};
