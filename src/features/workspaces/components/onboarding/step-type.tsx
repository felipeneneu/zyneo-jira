import React from "react";
import { FaChartLine, FaCode, FaGears, FaPalette } from "react-icons/fa6";

import { useWizard } from "./store";
import { OptionCard } from "./option-card";
import { WizardStepLayout } from "./wizard-step-layout";
import { WorkspaceType } from "./types";

const ACTIVE_WORKSPACE_TYPES: WorkspaceType[] = ["software_dev", "design"];

export function StepType() {
  const { state, dispatch } = useWizard();

  const handleSelect = (type: WorkspaceType) => {
    if (!ACTIVE_WORKSPACE_TYPES.includes(type)) return;
    dispatch({ type: "SET_TYPE", payload: type });
  };

  return (
    <WizardStepLayout
      title="O que voce deseja gerenciar?"
      description="Escolha a categoria que melhor se adapta as suas necessidades."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <OptionCard
          title="Desenvolvimento de Software"
          description="Rastreamento de bugs e sprints."
          icon={<FaCode />}
          selected={state.type === "software_dev"}
          onClick={() => handleSelect("software_dev")}
          iconColor="text-blue-500"
        />
        <OptionCard
          title="Design / Criativo"
          description="Gestao de ativos e feedback."
          icon={<FaPalette />}
          selected={state.type === "design"}
          onClick={() => handleSelect("design")}
          iconColor="text-purple-500"
        />
        <OptionCard
          title="Operacoes / Processos"
          description="SOPs e recrutamento."
          icon={<FaGears />}
          selected={false}
          onClick={() => {}}
          disabled
          disabledHint="Em breve"
          iconColor="text-gray-400"
        />
        <OptionCard
          title="Vendas / CRM"
          description="Pipelines e leads."
          icon={<FaChartLine />}
          selected={false}
          onClick={() => {}}
          disabled
          disabledHint="Em breve"
          iconColor="text-green-500"
        />
      </div>
    </WizardStepLayout>
  );
}
