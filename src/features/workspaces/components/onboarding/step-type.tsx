import React from "react";
import { FaCode, FaPalette, FaGears, FaChartLine } from "react-icons/fa6";
import { useWizard } from "./store";
import { WizardStepLayout } from "./wizard-step-layout";
import { OptionCard } from "./option-card";
import { WorkspaceType } from "./types";

export function StepType() {
  const { state, dispatch } = useWizard();

  const handleSelect = (type: WorkspaceType) => {
    dispatch({ type: "SET_TYPE", payload: type });
  };

  return (
    <WizardStepLayout
      title="O que você deseja gerenciar?"
      description="Escolha a categoria que melhor se adapta às suas necessidades."
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
          description="Gestão de ativos e feedback."
          icon={<FaPalette />}
          selected={state.type === "design"}
          onClick={() => handleSelect("design")}
          iconColor="text-purple-500"
        />
        <OptionCard
          title="Operações / Processos"
          description="SOPs e recrutamento."
          icon={<FaGears />}
          selected={state.type === "operations"}
          onClick={() => handleSelect("operations")}
          iconColor="text-gray-400"
        />
        <OptionCard
          title="Vendas / CRM"
          description="Pipelines e leads."
          icon={<FaChartLine />}
          selected={state.type === "sales_crm"}
          onClick={() => handleSelect("sales_crm")}
          iconColor="text-green-500"
        />
      </div>
    </WizardStepLayout>
  );
}
