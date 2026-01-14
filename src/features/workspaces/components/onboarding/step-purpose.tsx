import React from "react";
import { FaUser, FaGraduationCap, FaBriefcase } from "react-icons/fa6";
import { useWizard } from "./store";
import { WizardStepLayout } from "./wizard-step-layout";
import { OptionCard } from "./option-card";
import { WorkspacePurpose } from "./types";

export function StepPurpose() {
  const { state, dispatch } = useWizard();

  const handleSelect = (purpose: WorkspacePurpose) => {
    dispatch({ type: "SET_PURPOSE", payload: purpose });
  };

  return (
    <WizardStepLayout
      title="Para que você usará esse espaço de trabalho?"
      description="Personalizaremos sua experiência com base na sua escolha."
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
        <OptionCard
          title="Trabalho"
          description="Gerenciar projetos e equipes."
          icon={<FaBriefcase />}
          selected={state.purpose === "work"}
          onClick={() => handleSelect("work")}
          iconColor="text-blue-400"
        />
        <OptionCard
          title="Pessoal"
          description="Organizar tarefas diárias."
          icon={<FaUser />}
          selected={state.purpose === "personal"}
          onClick={() => handleSelect("personal")}
          iconColor="text-purple-400"
        />
        <OptionCard
          title="Escola"
          description="Planejar estudos e aulas."
          icon={<FaGraduationCap />}
          selected={state.purpose === "school"}
          onClick={() => handleSelect("school")}
          iconColor="text-green-400"
        />
      </div>
    </WizardStepLayout>
  );
}
