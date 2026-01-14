import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizard } from "./store";
import { WizardStepLayout } from "./wizard-step-layout";
import { step3Schema } from "./schemas";
import { TeamSize, MainGoal, WorkflowStyle } from "./types";
import { Label } from "@/src/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/ui/select";
import { cn } from "@/src/lib/utils";

type Step3FormData = {
  teamSize: TeamSize;
  mainGoal: MainGoal;
  workflowStyle: WorkflowStyle;
};

export function StepMethodology() {
  const { state, dispatch } = useWizard();
  
  const { control } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      teamSize: state.teamSize,
      mainGoal: state.mainGoal,
      workflowStyle: state.workflowStyle,
    },
    mode: "onChange"
  });

  const updateState = <K extends keyof Step3FormData>(key: K, value: Step3FormData[K]) => {
     // We need to merge with current values because we are updating individual fields
     // logic: create a partial update or just update the specific field in the store if the store supported it.
     // Since store SET_METHODOLOGY takes the whole object, we need to construct it.
     // Actually, looking at store 'SET_METHODOLOGY' payload: { teamSize, mainGoal, workflowStyle }
     // We can just rely on the existing state for the other fields since we initialize from it!
     
     const newState = {
        teamSize: state.teamSize,
        mainGoal: state.mainGoal,
        workflowStyle: state.workflowStyle,
        [key]: value
     };
     dispatch({ type: "SET_METHODOLOGY", payload: newState });
  };

  return (
    <WizardStepLayout
      title="Como você costuma trabalhar?"
      description="Vamos configurar seu ambiente de trabalho."
    >
      <div className="space-y-6 max-w-md mx-auto mt-4 px-1 text-left">
        
        <div className="space-y-2">
          <Label className="text-gray-300">Tamanho da Equipe</Label>
          <Controller
            control={control}
            name="teamSize"
            render={({ field }) => (
              <Select 
                onValueChange={(val) => {
                    field.onChange(val);
                    updateState("teamSize", val as TeamSize);
                }} 
                defaultValue={field.value}
              >
                <SelectTrigger className="border-gray-700 bg-gray-900/50 text-white focus:ring-purple-500/50">
                  <SelectValue placeholder="Selecione o tamanho da equipe" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="solo">Só eu (Solo)</SelectItem>
                  <SelectItem value="small">2-5 pessoas</SelectItem>
                  <SelectItem value="medium">6-15 pessoas</SelectItem>
                  <SelectItem value="large">16-50 pessoas</SelectItem>
                  <SelectItem value="enterprise">50+ pessoas</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Objetivo Principal</Label>
          <Controller
            control={control}
            name="mainGoal"
            render={({ field }) => (
              <Select 
                onValueChange={(val) => {
                    field.onChange(val);
                    updateState("mainGoal", val as MainGoal);
                }}  
                defaultValue={field.value}
              >
                <SelectTrigger className="border-gray-700 bg-gray-900/50 text-white focus:ring-purple-500/50">
                  <SelectValue placeholder="Qual é seu foco principal?" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="organize">Organizar tarefas e projetos</SelectItem>
                  <SelectItem value="deliver">Entregar mais rápido</SelectItem>
                  <SelectItem value="sell">Vender mais</SelectItem>
                  <SelectItem value="standardize">Padronizar processos</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-gray-300">Estilo de Fluxo de Trabalho</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'kanban', label: 'Kanban' },
              { value: 'scrum', label: 'Sprints' },
              { value: 'simple', label: 'Lista' }
            ].map((option) => (
              <Controller
                key={option.value}
                control={control}
                name="workflowStyle"
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => {
                        field.onChange(option.value);
                        updateState("workflowStyle", option.value as WorkflowStyle);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all hover:bg-gray-800",
                      field.value === option.value
                         ? "border-purple-500 bg-purple-500/10 text-white"
                        : "border-gray-700 text-gray-400"
                    )}
                  >
                    {option.label}
                  </button>
                )}
              />
            ))}
          </div>
        </div>

      </div>
    </WizardStepLayout>
  );
}
