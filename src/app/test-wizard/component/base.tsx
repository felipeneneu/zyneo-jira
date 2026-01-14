"use client";

import { useState } from "react";
import { Button } from "@/src/ui/button";
import { Input } from "@/src/ui/input";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

const steps = [
  { id: 1, title: "Quais recursos você gostaria de experimentar?" },
  { id: 2, title: "Para que você usará esse espaço de trabalho?" },
  {
    id: 3,
    title: "Por fim, qual nome você gostaria de dar ao seu Espaço de trabalho?",
  },
  { id: 4, title: "Você usa alguma dessas ferramentas?" },
  { id: 5, title: "Convide pessoas para seu Espaço de trabalho:" },
  { id: 6, title: "O que você deseja gerenciar?" },
];

interface FeatureOption {
  id: string;
  label: string;
  icon: string;
}

interface WorkspaceOption {
  id: string;
  label: string;
}

interface ToolOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface ManagementOption {
  id: string;
  label: string;
}

const features: FeatureOption[] = [
  { id: "tracking", label: "Rastreamento", icon: "⏱️" },
  { id: "panels", label: "Painéis", icon: "📊" },
  { id: "whiteboards", label: "Whiteboards", icon: "⬜" },
  { id: "sprints", label: "Sprints", icon: "⚡" },
  { id: "automations", label: "Automações", icon: "⚙️" },
  { id: "calendar", label: "Calendário", icon: "📅" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "workload", label: "Carga de tra...", icon: "📈" },
  { id: "documents", label: "Documentos...", icon: "📄" },
  { id: "ai", label: "IA", icon: "✨" },
  { id: "forms", label: "Formulários", icon: "☑️" },
  { id: "goals", label: "Metas e OKRs", icon: "🎯" },
  { id: "boards", label: "Quadros e K...", icon: "📋" },
  { id: "charts", label: "Gráficos de ...", icon: "📉" },
  { id: "schedule", label: "Agendamento", icon: "📆" },
  { id: "tasks", label: "Tarefas e pro...", icon: "✅" },
  { id: "crm", label: "CRM", icon: "👥" },
  { id: "clips", label: "Clipes", icon: "▶️" },
];

const workspaceTypes: WorkspaceOption[] = [
  { id: "work", label: "Trabalho" },
  { id: "personal", label: "Pessoal" },
  { id: "school", label: "Escola" },
];

const tools: ToolOption[] = [
  { id: "github", label: "GitHub", icon: "🐙", color: "text-white" },
  { id: "slack", label: "Slack", icon: "#", color: "text-purple-400" },
  { id: "asana", label: "Asana", icon: "🔴", color: "text-red-400" },
  { id: "wrike", label: "Wrike", icon: "✓", color: "text-green-400" },
  { id: "drive", label: "Google Drive", icon: "📁", color: "text-blue-400" },
  { id: "teams", label: "MS Teams", icon: "👥", color: "text-purple-500" },
  { id: "monday", label: "Monday", icon: "📊", color: "text-red-500" },
  { id: "jira", label: "Jira", icon: "🔷", color: "text-blue-500" },
  { id: "trello", label: "Trello", icon: "📋", color: "text-blue-400" },
  { id: "basecamp", label: "Basecamp", icon: "⛺", color: "text-green-500" },
  { id: "zoom", label: "Zoom", icon: "📹", color: "text-blue-500" },
  { id: "confluence", label: "Confluence", icon: "🔷", color: "text-blue-400" },
  { id: "excel", label: "Excel & CSV", icon: "📊", color: "text-green-500" },
  { id: "notion", label: "Notion", icon: "📝", color: "text-white" },
  { id: "figma", label: "Figma", icon: "🎨", color: "text-purple-500" },
  { id: "salesforce", label: "Salesforce", icon: "☁️", color: "text-blue-400" },
  { id: "todoist", label: "Todoist", icon: "✔️", color: "text-red-500" },
  { id: "dropbox", label: "Dropbox", icon: "📦", color: "text-blue-500" },
];

const managementOptions: ManagementOption[] = [
  { id: "personal", label: "Uso pessoal" },
  { id: "services", label: "Serviços profissionais" },
  { id: "marketing", label: "Marketing" },
  { id: "operations", label: "Operações" },
  { id: "sales", label: "Vendas + CRM" },
  { id: "pmo", label: "PMO" },
  { id: "creative", label: "Criativo e design" },
  { id: "startup", label: "Start-up" },
  { id: "it", label: "TI" },
  { id: "software", label: "desenvolvimento de software" },
  { id: "finance", label: "Contabilidade e Finanças" },
  { id: "support", label: "Suporte" },
  { id: "hr", label: "RH e Recrutamento" },
  { id: "others", label: "Outros" },
];

export function OnboardingModal() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [workspaceType, setWorkspaceType] = useState<string>("");
  const [workspaceName, setWorkspaceName] = useState(
    "Felipe Neneu's Workspace"
  );
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [inviteEmails, setInviteEmails] = useState("");
  const [selectedManagement, setSelectedManagement] = useState<string[]>([
    "software",
  ]);

  const toggleSelection = (
    id: string,
    list: string[],
    setter: (list: string[]) => void
  ) => {
    if (list.includes(id)) {
      setter(list.filter((item) => item !== id));
    } else {
      setter([...list, id]);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Onboarding finished
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
      <div className="relative w-full max-w-4xl">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-500">
              <div className="h-3 w-3 md:h-4 md:w-4 rotate-45 bg-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-white">
              ClickUp
            </span>
          </div>
        </div>

        {currentStep === 2 && (
          <div className="mb-4 md:mb-6 text-right">
            <p className="text-xs md:text-sm text-gray-400">
              Que bom ter você aqui, Felipe Neneu!
            </p>
          </div>
        )}

        <div className="mb-6 md:mb-8">
          <h1 className="mb-6 md:mb-8 text-2xl md:text-3xl font-bold text-white text-balance leading-tight">
            {steps[currentStep - 1].title}
          </h1>

          {currentStep === 1 && (
            <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() =>
                    toggleSelection(
                      feature.id,
                      selectedFeatures,
                      setSelectedFeatures
                    )
                  }
                  className={cn(
                    "group relative flex items-center gap-2 md:gap-3 rounded-lg border border-gray-700 bg-gray-900/50 px-3 md:px-4 py-2.5 md:py-3 text-left transition-all hover:border-gray-600",
                    selectedFeatures.includes(feature.id) &&
                      "border-purple-500 bg-purple-500/10"
                  )}
                >
                  <span className="text-base md:text-xl">{feature.icon}</span>
                  <span className="flex-1 text-xs md:text-sm font-medium text-gray-300 truncate">
                    {feature.label}
                  </span>
                  <div
                    className={cn(
                      "h-4 w-4 md:h-5 md:w-5 rounded-full border-2 border-gray-600 transition-all flex-shrink-0",
                      selectedFeatures.includes(feature.id) &&
                        "border-purple-500 bg-purple-500"
                    )}
                  >
                    {selectedFeatures.includes(feature.id) && (
                      <Check className="h-full w-full p-0.5 text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
              {workspaceTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setWorkspaceType(type.id)}
                  className={cn(
                    "rounded-full border border-gray-700 bg-gray-900/50 px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-medium text-gray-300 transition-all hover:border-gray-600",
                    workspaceType === type.id &&
                      "border-purple-500 bg-purple-500/10 text-white"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3 md:space-y-4">
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="h-12 md:h-14 border-gray-700 bg-gray-900/50 text-base md:text-lg text-white placeholder:text-gray-500"
                placeholder="Nome do espaço de trabalho"
              />
              <p className="text-xs md:text-sm text-gray-400">
                Insira o nome da equipe ou organização.
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() =>
                    toggleSelection(tool.id, selectedTools, setSelectedTools)
                  }
                  className={cn(
                    "group relative flex items-center gap-2 md:gap-3 rounded-lg border border-gray-700 bg-gray-900/50 px-3 md:px-4 py-2.5 md:py-3 text-left transition-all hover:border-gray-600",
                    selectedTools.includes(tool.id) &&
                      "border-purple-500 bg-purple-500/10"
                  )}
                >
                  <span className={cn("text-base md:text-xl", tool.color)}>
                    {tool.icon}
                  </span>
                  <span className="flex-1 text-xs md:text-sm font-medium text-gray-300 truncate">
                    {tool.label}
                  </span>
                  <div
                    className={cn(
                      "h-4 w-4 md:h-5 md:w-5 rounded-full border-2 border-gray-600 transition-all flex-shrink-0",
                      selectedTools.includes(tool.id) &&
                        "border-purple-500 bg-purple-500"
                    )}
                  >
                    {selectedTools.includes(tool.id) && (
                      <Check className="h-full w-full p-0.5 text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-3 md:space-y-4">
              <Input
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                className="h-12 md:h-14 border-gray-700 bg-gray-900/50 text-base md:text-lg text-white placeholder:text-gray-500"
                placeholder="Insira os endereços de e-mail (ou cole múltiplos)"
              />
              <div className="flex items-start gap-2 rounded-lg bg-green-500/10 p-3 md:p-4">
                <div className="mt-0.5 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-green-500 flex-shrink-0">
                  <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                </div>
                <p className="text-xs md:text-sm text-green-400">
                  Não faça todo o trabalho. Convide sua equipe para começar 200%
                  mais rápido.
                </p>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {managementOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      toggleSelection(
                        option.id,
                        selectedManagement,
                        setSelectedManagement
                      )
                    }
                    className={cn(
                      "rounded-full border border-gray-700 bg-gray-900/50 px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-300 transition-all hover:border-gray-600",
                      selectedManagement.includes(option.id) &&
                        "border-white bg-white text-black"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-4 md:mt-6 text-xs md:text-sm text-gray-500">
                Não se preocupe, você poderá adicionar mais quando quiser.
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 md:mb-6">
          <div className="h-0.5 md:h-1 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="hidden md:flex items-center justify-between">
          <Button
            onClick={handleBack}
            disabled={currentStep === 1}
            variant="ghost"
            className="gap-2 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              className="gap-2 bg-white text-black hover:bg-gray-200"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              className="gap-2 bg-white text-black hover:bg-gray-200"
            >
              Terminar
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {currentStep === 1 && (
          <p className="mt-4 md:mt-6 text-xs md:text-sm text-gray-500">
            Não se preocupe, você terá acesso a tudo isso em seu espaço de
            trabalho.
          </p>
        )}
      </div>
    </div>
  );
}
