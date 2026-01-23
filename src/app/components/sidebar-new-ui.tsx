"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Users,
  CheckSquare,
  Bell,
  MessageCircle,
  Sun,
  Moon,
  Plus,
  Folder,
  FolderOpen,
  FileText,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const projectFolders = [
  {
    id: "all-projects",
    name: "All projects",
    count: 3,
    type: "folder" as const,
    children: [
      {
        id: "design-system",
        name: "Design system",
        type: "folder" as const,
        active: true,
        children: [
          { id: "ds-components", name: "Components", type: "file" as const },
          { id: "ds-tokens", name: "Design tokens", type: "file" as const },
          { id: "ds-docs", name: "Documentation", type: "file" as const },
        ],
      },
      {
        id: "user-flow",
        name: "User flow",
        type: "folder" as const,
        children: [
          { id: "uf-onboarding", name: "Onboarding", type: "file" as const },
          { id: "uf-checkout", name: "Checkout", type: "file" as const },
        ],
      },
      {
        id: "ux-research",
        name: "Ux research",
        type: "folder" as const,
        children: [
          {
            id: "ur-interviews",
            name: "User interviews",
            type: "file" as const,
          },
          { id: "ur-surveys", name: "Surveys", type: "file" as const },
        ],
      },
    ],
  },
];

const taskFolders = [
  {
    id: "all-tasks",
    name: "All tasks",
    count: 11,
    type: "folder" as const,
    children: [
      { id: "todo", name: "To do", count: 4, type: "folder" as const },
      {
        id: "in-progress",
        name: "In progress",
        count: 4,
        type: "folder" as const,
        active: true,
      },
      { id: "done", name: "Done", count: 3, type: "folder" as const },
    ],
  },
];

type FolderItem = {
  id: string;
  name: string;
  count?: number;
  type: "folder" | "file";
  active?: boolean;
  children?: FolderItem[];
};

function FolderTree({
  items,
  level = 0,
  openFolders,
  toggleFolder,
}: {
  items: FolderItem[];
  level?: number;
  openFolders: Set<string>;
  toggleFolder: (id: string) => void;
}) {
  return (
    <div className={cn("space-y-1", level > 0 && "ml-4 mt-1")}>
      {items.map((item) => {
        const isOpen = openFolders.has(item.id);
        const hasChildren = item.children && item.children.length > 0;

        return (
          <div key={item.id}>
            <button
              onClick={() => hasChildren && toggleFolder(item.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                item.active
                  ? "bg-gray-100 text-black"
                  : "text-gray-500 hover:bg-gray-100 hover:text-black",
              )}
            >
              <div className="flex items-center gap-2">
                {hasChildren ? (
                  isOpen ? (
                    <>
                      <FolderOpen className="h-4 w-4 text-gray-400" />
                      {level === 0 && <span>{item.name}</span>}
                      {level > 0 && (
                        <span className="text-xs">{item.name}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <Folder className="h-4 w-4 text-gray-400" />
                      {level === 0 && <span>{item.name}</span>}
                      {level > 0 && (
                        <span className="text-xs">{item.name}</span>
                      )}
                    </>
                  )
                ) : (
                  <>
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-xs">{item.name}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {item.count !== undefined && (
                  <span className="text-xs text-gray-400">({item.count})</span>
                )}
                {hasChildren && (
                  <span className="text-gray-400">
                    {isOpen ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </span>
                )}
              </div>
            </button>
            {hasChildren && isOpen && (
              <FolderTree
                items={item.children!}
                level={level + 1}
                openFolders={openFolders}
                toggleFolder={toggleFolder}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SidebarNew() {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [openFolders, setOpenFolders] = useState<Set<string>>(
    new Set(["all-projects", "design-system", "all-tasks"]),
  );

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full w-60 flex-col bg-white text-black">
      {/* Logo and header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Projects</span>
        </div>
        <button className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 hover:bg-gray-200">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {/* Team */}
        <div className="mb-1">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-black">
            <Users className="h-4 w-4" />
            <span>Team</span>
          </button>
        </div>

        {/* Projects */}
        <div className="mb-1">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-black hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-4 w-4" />
              <span>Projects</span>
            </div>
            {projectsOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {projectsOpen && (
            <FolderTree
              items={projectFolders}
              openFolders={openFolders}
              toggleFolder={toggleFolder}
            />
          )}
        </div>

        {/* Tasks */}
        <div className="mb-1">
          <button
            onClick={() => setTasksOpen(!tasksOpen)}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-black hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="h-4 w-4" />
              <span>Tasks</span>
            </div>
            {tasksOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {tasksOpen && (
            <FolderTree
              items={taskFolders}
              openFolders={openFolders}
              toggleFolder={toggleFolder}
            />
          )}
        </div>

        {/* Reminders */}
        <div className="mb-1">
          <button className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-black">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4" />
              <span>Reminders</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Messengers */}
        <div className="mb-1">
          <button className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-black">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4" />
              <span>Messengers</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Bottom section - theme toggle */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setDarkMode(false)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              !darkMode ? "bg-white text-black shadow-sm" : "text-gray-500",
            )}
          >
            <Sun className="h-4 w-4" />
            Light
          </button>
          <button
            onClick={() => setDarkMode(true)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              darkMode ? "bg-white text-black shadow-sm" : "text-gray-500",
            )}
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
