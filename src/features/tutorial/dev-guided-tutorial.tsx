"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Task } from "@/src/features/tasks/types";
import { TaskStatus } from "@/src/features/tasks/types";
import { Button } from "@/src/ui/button";
import { Card, CardContent } from "@/src/ui/card";
import { DEV_GUIDED_TUTORIAL_TASKS } from "./dev-guided-tutorial-config";

interface DevGuidedTutorialProps {
  workspaceId: string;
  workspaceType?: string | null;
  tasks: Task[];
}

const getStorageKey = (workspaceId: string) =>
  `tutorial:dev-guided:v1:${workspaceId}`;

export const DevGuidedTutorial = ({
  workspaceId,
  workspaceType,
  tasks,
}: DevGuidedTutorialProps) => {
  const [isDone, setIsDone] = useState(true);
  const [step, setStep] = useState(1);
  const [step2Done, setStep2Done] = useState(false);

  const isDevGuided = workspaceType === "software_dev";

  useEffect(() => {
    if (!isDevGuided) return;
    const key = getStorageKey(workspaceId);
    const stored = localStorage.getItem(key);
    setIsDone(stored === "done");
  }, [isDevGuided, workspaceId]);

  const step1Complete = useMemo(
    () =>
      tasks.some(
        (task) =>
          task.name.startsWith("[Tutorial]") &&
          task.status === TaskStatus.READY
      ),
    [tasks]
  );

  const step3Complete = useMemo(
    () =>
      tasks.some(
        (task) =>
          task.name === DEV_GUIDED_TUTORIAL_TASKS.inReview &&
          task.status === TaskStatus.DONE
      ),
    [tasks]
  );

  useEffect(() => {
    if (!isDevGuided || isDone) return;
    if (step === 1 && step1Complete) {
      setStep(2);
    }
    if (step === 3 && step3Complete) {
      localStorage.setItem(getStorageKey(workspaceId), "done");
      setIsDone(true);
    }
  }, [isDevGuided, isDone, step, step1Complete, step3Complete, workspaceId]);

  if (!isDevGuided || isDone) return null;

  return (
    <Card className="border border-amber-200 bg-amber-50/60">
      <CardContent className="space-y-3 p-4 text-sm text-amber-900">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase text-amber-700">Guided Dev</p>
          <p className="font-semibold">Setup rapido (3 passos)</p>
        </div>

        {step === 1 && (
          <div className="space-y-2">
            <p className="font-medium">Passo 1: mova uma tarefa tutorial para Ready.</p>
            <p>
              Ready exige responsável e prioridade. Ajuste a tarefa e mova para
              Ready no Kanban.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setStep(2)}
              disabled={!step1Complete}
            >
              {step1Complete ? "Continuar" : "Aguardando tarefa em Ready"}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <p className="font-medium">Passo 2: abra suas notificações.</p>
            <p>Veja alertas de atraso, tarefas paradas e bloqueios.</p>
            <Button
              asChild
              size="sm"
              variant="secondary"
              onClick={() => {
                setStep2Done(true);
                setStep(3);
              }}
            >
              <Link href="/notifications">Abrir notificações</Link>
            </Button>
            {step2Done && (
              <p className="text-xs text-amber-700">
                Notificações abertas. Vamos para o passo final.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <p className="font-medium">Passo 3: conclua a tarefa em Review.</p>
            <p>Mova a tarefa tutorial em Review para Done.</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (step3Complete) {
                  localStorage.setItem(getStorageKey(workspaceId), "done");
                  setIsDone(true);
                }
              }}
              disabled={!step3Complete}
            >
              {step3Complete ? "Finalizar" : "Aguardando tarefa em Done"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
