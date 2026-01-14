"use client";

import React, { useState } from "react";
import { WorkspaceWizard } from "@/src/features/workspaces/components/onboarding/workspace-wizard";
import { Button } from "@/src/ui/button";
import { WorkspaceOnboardingState } from "@/src/features/workspaces/components/onboarding/types";
import { FaWandMagicSparkles } from "react-icons/fa6";

export default function TestWizardPage() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<WorkspaceOnboardingState | null>(null);

  const handleComplete = (data: WorkspaceOnboardingState) => {

    setResult(data);
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 p-4">
        <div className="text-center space-y-6 max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">Workspace Wizard</h1>
          <p className="text-muted-foreground text-lg">
            Verification page for the Modal Wizard implementation.
          </p>
          
          <Button 
            size="lg" 
            onClick={() => {
              setResult(null);
              setOpen(true);
            }}
            className="gap-2 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <FaWandMagicSparkles /> Start Onboarding
          </Button>

          {result && (
            <div className="mt-8 p-6 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-xl text-left shadow-sm animate-in fade-in slide-in-from-bottom-4 w-full">
              <h3 className="font-semibold text-green-600 mb-2">Success! Configuration Output:</h3>
              <pre className="bg-neutral-100 dark:bg-black p-4 rounded-lg text-xs overflow-auto max-h-[300px] text-neutral-800 dark:text-neutral-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      
      <WorkspaceWizard 
        open={open} 
        onOpenChange={setOpen} 
        onComplete={handleComplete} 
      />
    </div>
  );
}
