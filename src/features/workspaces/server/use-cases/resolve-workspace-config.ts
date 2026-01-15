import type { WorkspaceType } from "../../types";
import { getWorkspacePreset, mergeWorkspaceTools } from "../../domain/workspace-presets";

type ResolveWorkspaceConfigInput = {
  workspaceType?: WorkspaceType;
  tools?: string[];
  capabilities?: string[];
};

export const resolveWorkspaceConfig = ({
  workspaceType,
  tools,
  capabilities,
}: ResolveWorkspaceConfigInput) => {
  const preset = getWorkspacePreset(workspaceType);

  return {
    capabilities: capabilities ?? preset?.capabilities,
    tools: mergeWorkspaceTools(preset?.tools ?? [], tools),
    agentProfileSlug: preset?.agentProfileSlug ?? null,
  };
};
