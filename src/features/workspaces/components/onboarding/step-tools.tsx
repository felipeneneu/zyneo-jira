import React from "react";
import { useWizard } from "./store";
import { OptionCard } from "./option-card";
import {
  FaGithub,
  FaSlack,
  FaTrello,
  FaJira,
  FaGoogleDrive,
  FaMicrosoft,
  FaFigma,
  FaSalesforce,
} from "react-icons/fa6";
import { SiNotion, SiZoom, SiAsana } from "react-icons/si";

export function StepTools() {
  const { state, dispatch } = useWizard();

  const toggleTool = (toolId: string) => {
    const currentTools = state.tools || [];
    const newTools = currentTools.includes(toolId)
      ? currentTools.filter((id) => id !== toolId)
      : [...currentTools, toolId];
    dispatch({ type: "SET_TOOLS", payload: newTools });
  };

  const tools = [
    { id: "github", label: "GitHub", icon: <FaGithub />, color: "text-white" },
    {
      id: "slack",
      label: "Slack",
      icon: <FaSlack />,
      color: "text-purple-400",
    },
    { id: "jira", label: "Jira", icon: <FaJira />, color: "text-blue-500" },
    {
      id: "trello",
      label: "Trello",
      icon: <FaTrello />,
      color: "text-blue-400",
    },
    {
      id: "google_drive",
      label: "Google Drive",
      icon: <FaGoogleDrive />,
      color: "text-green-500",
    },
    {
      id: "teams",
      label: "MS Teams",
      icon: <FaMicrosoft />,
      color: "text-blue-600",
    },
    { id: "notion", label: "Notion", icon: <SiNotion />, color: "text-white" },
    { id: "asana", label: "Asana", icon: <SiAsana />, color: "text-red-400" },
    { id: "figma", label: "Figma", icon: <FaFigma />, color: "text-pink-500" },
    { id: "zoom", label: "Zoom", icon: <SiZoom />, color: "text-blue-400" },
    { id: "wrike", label: "Wrike", icon: "Wrike", color: "text-green-400" },
    {
      id: "salesforce",
      label: "Salesforce",
      icon: <FaSalesforce />,
      color: "text-blue-400",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl md:text-3xl font-bold text-white text-balance">
          Você usa alguma dessas ferramentas?
        </h1>
        <p className="text-sm text-gray-400">
          Selecione as que você usa para integrarmos seu fluxo.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-8">
        {tools.map((tool) => (
          <OptionCard
            key={tool.id}
            title={tool.label}
            icon={tool.icon}
            selected={state.tools.includes(tool.id)}
            onClick={() => toggleTool(tool.id)}
            iconColor={tool.color}
            className="px-3 py-3"
          />
        ))}
      </div>
    </div>
  );
}
