import React from "react";
import { useWizard } from "./store";
import { WizardStepLayout } from "./wizard-step-layout";
import { Input } from "@/src/ui/input";
import { FaCheck } from "react-icons/fa6";

export function StepInvite() {
  const { state, dispatch } = useWizard();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const emails = value.split(',').map(s => s.trim()).filter(Boolean);
    dispatch({ type: "SET_INVITES", payload: emails });
  };

  const inputValue = state.invites.join(', ');

  return (
    <WizardStepLayout
      title="Convide pessoas para seu Espaço de trabalho"
    >
      <div className="space-y-4 max-w-lg mx-auto">
        <Input
          defaultValue={inputValue}
          onChange={handleChange}
          className="h-12 md:h-14 border-gray-700 bg-gray-900/50 text-base md:text-lg text-white placeholder:text-gray-500 focus-visible:ring-purple-500/50"
          placeholder="Insira os endereços de e-mail (ou cole múltiplos)"
        />
        
        <div className="flex items-start gap-3 rounded-lg bg-green-500/10 p-4 border border-green-500/20 text-left">
          <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 flex-shrink-0">
            <FaCheck className="h-2.5 w-2.5 text-white" />
          </div>
          <p className="text-sm text-green-400">
            Não faça todo o trabalho. Convide sua equipe para começar agora mesmo.
          </p>
        </div>
      </div>
    </WizardStepLayout>
  );
}
