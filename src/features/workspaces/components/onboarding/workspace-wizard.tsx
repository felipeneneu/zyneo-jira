"use client";

import React from "react";
import { WizardProvider, useWizard } from "./store";
import { StepType } from "./step-type";
import { StepIdentity } from "./step-identity";
import { WorkspaceOnboardingState } from "./types";
import { cn } from "@/src/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/src/ui/dialog";
import { Button } from "@/src/ui/button";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { ScrollArea } from "@/src/ui/scroll-area";
import { step1Schema, step2Schema } from "./schemas";

interface WorkspaceWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: WorkspaceOnboardingState) => void;
}

function WizardContent({
  onComplete,
}: {
  onComplete: (data: WorkspaceOnboardingState) => void;
}) {
  const { state, dispatch } = useWizard();

  const handleNext = () => {
    // Validation Logic centralized here (simplified)
    if (
      state.step === 1 &&
      !step1Schema.safeParse({ type: state.type }).success
    )
      return;
    if (state.step === 2 && !step2Schema.safeParse({ ...state }).success)
      return;

    if (state.step === state.totalSteps) {
      onComplete(state);
    } else {
      dispatch({ type: "NEXT_STEP" });
    }
  };

  const handleBack = () => {
    dispatch({ type: "PREV_STEP" });
  };

  // Determine if Next is disabled
  const isNextDisabled =
    (state.step === 1 && !state.type) ||
    (state.step === 2 && !state.name.trim());

  return (
    <div className="grid min-h-0 grid-rows-[auto_1fr_auto] h-full w-full bg-zinc-950 text-white">
      {/* 1. Header (Logo) */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-b border-white/5 flex items-center justify-between bg-zinc-950 z-20">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">ProjetaAi</span>
        </div>
        <div className="text-sm text-zinc-500 font-medium">
          Passo {state.step} de {state.totalSteps}
        </div>
      </div>

      {/* 2. Content (Scrollable) */}
      <div className="relative min-h-0 overflow-hidden w-full max-w-[950px] mx-auto">
        <ScrollArea className="h-full w-full">
          <div className="px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-32 md:p-12 md:pb-32 flex flex-col items-center text-center">
            {state.step === 1 && <StepType />}
            {state.step === 2 && <StepIdentity />}
          </div>
        </ScrollArea>

        {/* System-based Gradient Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-cyan-900/30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none z-10" /> */}
        {/* Gradiente de fundo com efeito suave e acinzentado */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 via-transparent to-slate-500/10 pointer-events-none " />

        {/* Gradiente inferior estilo "Glass" (vidro) mais neutro */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none z-10 " />
      </div>

      {/* 3. Footer (Navigation) */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-t border-white/5 bg-zinc-900/30 backdrop-blur-sm z-20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full max-w-[950px] mx-auto">
        <div className="grid grid-cols-2 gap-4 px-2 justify-center w-full">
          <Button
            onClick={handleBack}
            disabled={state.step === 1}
            variant="ghost"
            size="lg"
            className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5 w-full sm:w-auto"
          >
            <FaChevronLeft className="h-3 w-3" />
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={isNextDisabled}
            size="lg"
            className="gap-2 bg-white text-black hover:bg-zinc-200 font-medium px-8 rounded-full shadow-lg shadow-purple-500/10"
          >
            {state.step === state.totalSteps ? "Concluir" : "Proximo"}
            <FaChevronRight className="h-3 w-3" />
          </Button>
          <div className="w-full grid justify-center col-span-2">
            <div className="flex gap-1 mr-0  sm:mr-4 items-center">
              {Array.from({ length: state.totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i + 1 === state.step
                      ? "w-8 bg-purple-500"
                      : "w-1.5 bg-zinc-800",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceWizard({
  open,
  onOpenChange,
  onComplete,
}: WorkspaceWizardProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[100vw] max-w-none h-[100dvh] sm:h-[90vh] lg:h-[85vh] p-0 border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl rounded-none sm:rounded-lg sm:w-full sm:max-w-[950px]"
        aria-describedby="workspace-wizard"
      >
        <DialogTitle className="sr-only">Workspace Wizard</DialogTitle>
        <WizardProvider>
          <WizardContent onComplete={onComplete} />
        </WizardProvider>
      </DialogContent>
    </Dialog>
  );
}
