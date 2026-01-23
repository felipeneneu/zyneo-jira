"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  UserIcon,
  SettingsIcon,
  MessageSquare,
  Bell,
  Code2,
  Users,
  LayoutGrid,
  CheckSquare,
  Sun,
  Moon,
  Plus,
} from "lucide-react";
import {
  GoHome,
  GoCheckCircle,
  GoHomeFill,
  GoCheckCircleFill,
} from "react-icons/go";

import { cn } from "@/src/lib/utils";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useGetProjects } from "@/src/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspace } from "@/src/features/workspaces/api/use-get-workspace-id";
import { ProjectAvatar } from "@/src/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/src/features/projects/hooks/use-create-project-modal";



type FolderItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  count?: number;
  active?: boolean;
  children?: FolderItem[];
  icon?: React.ReactNode;
  href?: string;
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

        // Content Rendering Logic
        const renderIcon = () => {
          if (item.icon) return item.icon;

          if (item.type === "folder") {
            return isOpen ? (
              <FolderOpen className="h-4 w-4 text-gray-400" />
            ) : (
              <Folder className="h-4 w-4 text-gray-400" />
            );
          }
          return <FileText className="h-4 w-4 text-gray-400" />;
        };

        const content = (
          <>
            <div className="flex items-center gap-2">
              {hasChildren ? (
                // Folder Logic: Arrow + Icon + Name
                <>
                  {isOpen ? (
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
                  )}
                </>
              ) : (
                // File Logic: Icon + Name
                <>
                  {item.icon || <FileText className="h-4 w-4 text-gray-400" />}
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
          </>
        );

        // Styling from SidebarNew
        const buttonClass = cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
          item.active
            ? "bg-gray-100 text-black"
            : "text-gray-500 hover:bg-gray-100 hover:text-black",
        );

        return (
          <div key={item.id}>
            {item.href ? (
              <Link href={item.href} className={buttonClass}>
                {content}
              </Link>
            ) : (
              <button
                onClick={() => hasChildren && toggleFolder(item.id)}
                className={buttonClass}
              >
                {content}
              </button>
            )}

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

// --- Main Component ---

const NAVIGATION_ROUTES = [
  {
    label: "Início",
    href: "/",
    icon: <GoHome className="h-4 w-4 text-gray-400" />,
    activeIcon: <GoHomeFill className="h-4 w-4 text-black" />, // Active color logic handled in rendering usually but let's be strict
    capability: "nav.home",
  },
  {
    label: "Minhas Tarefas",
    href: "/tasks",
    icon: <GoCheckCircle className="h-4 w-4 text-gray-400" />,
    activeIcon: <GoCheckCircleFill className="h-4 w-4 text-black" />,
    capability: "nav.tasks",
  },
  {
    label: "Chat",
    href: "/chat",
    icon: <MessageSquare className="h-4 w-4 text-gray-400" />,
    activeIcon: <MessageSquare className="h-4 w-4 text-black" />,
    capability: "nav.chat",
  },
  {
    label: "Notificações",
    href: "/notifications",
    icon: <Bell className="h-4 w-4 text-gray-400" />,
    activeIcon: <Bell className="h-4 w-4 text-black" />,
    capability: "nav.notifications",
    absolute: true,
  },
  {
    label: "Dev Hub",
    href: "/dev",
    icon: <Code2 className="h-4 w-4 text-gray-400" />,
    activeIcon: <Code2 className="h-4 w-4 text-black" />,
    capability: "nav.dev",
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: <SettingsIcon className="h-4 w-4 text-gray-400" />,
    activeIcon: <SettingsIcon className="h-4 w-4 text-black" />,
    capability: "nav.settings",
  },
  {
    label: "Membros",
    href: "/members",
    icon: <UserIcon className="h-4 w-4 text-gray-400" />,
    activeIcon: <UserIcon className="h-4 w-4 text-black" />,
    capability: "nav.members",
  },
];

export function SidebarNovo() {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();

  const { data: workspace } = useGetWorkspace({ workspaceId });
  const { data: projectsData } = useGetProjects({ workspaceId });
  const { open: openCreateProject } = useCreateProjectModal();
  
  const preset = getWorkspacePreset(workspace?.workspaceType);
  const capabilities = workspace?.capabilities ?? preset?.capabilities;

  const [openFolders, setOpenFolders] = useState<Set<string>>(
    new Set(["nav-root"]), // Default open navigation?
  );

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const navItems: FolderItem[] = NAVIGATION_ROUTES.filter(
    (route) => !capabilities || capabilities.includes(route.capability),
  )
    .map((route) => {
      if (!route.absolute && !workspaceId) return null;

      const fullHref = route.absolute
        ? route.href
        : `/workspaces/${workspaceId}${route.href}`;
      const isActive = route.absolute
        ? pathname === route.href
        : pathname === fullHref;

      return {
        id: `nav-${route.href}`,
        name: route.label,
        type: "file",
        active: isActive,
        href: fullHref,
        icon: isActive ? route.activeIcon : route.icon,
      };
    })
    .filter(Boolean) as FolderItem[];

  const projectItems: FolderItem[] =
    projectsData?.documents.map((project) => {
      const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
      const isActive = pathname === href;
      return {
        id: `proj-${project.$id}`,
        name: project.name,
        type: "file",
        href,
        active: isActive,
        icon: (
          <ProjectAvatar
            image={project.imageUrl}
            name={project.name}
            className="size-4 rounded-sm"
            fallbackClassName="text-[8px]"
          />
        ),
      };
    }) || [];

  return (
    <aside className="flex h-full w-full flex-col bg-white text-black border-r border-gray-200">
      {/* h-full bg-neutral-100 p-4 w-full */}
      {/* Header Area */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/">
            <Image src="/logo.svg" alt="logo" width={164} height={48} />
          </Link>
        </div>
        {/* Workspace Switcher integrated here */}
        <DottedSeparator className="my-6" />
        <WorkspaceSwitcher />
      </div>
      {/* Navigation Areas */}
      <nav className="flex-1 overflow-y-auto p-3">
        {/* Team (aka Main Navigation) */}
        <div className="mb-1">
          <button
            onClick={() => toggleFolder("nav-root")}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-black hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-4 w-4" />
              <span>Navegação</span>
            </div>
            {openFolders.has("nav-root") ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {openFolders.has("nav-root") && (
            <FolderTree
              items={navItems}
              openFolders={openFolders}
              toggleFolder={toggleFolder}
            />
          )}
        </div>

         {/* Projects */}
         <div className="mb-1">
             <div className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-black hover:bg-gray-100 group transition-colors">
                <button
                   onClick={() => toggleFolder("projects-root")}
                   className="flex items-center gap-3 flex-1"
                >
                   <CheckSquare className="h-4 w-4" />
                   <span>Projetos</span>
                </button>
                
                <div className="flex items-center gap-1">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            openCreateProject();
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                        title="Criar Projeto"
                    >
                        <Plus className="h-4 w-4 text-gray-500" />
                    </button>
                    <button 
                         onClick={() => toggleFolder("projects-root")}
                         className="flex items-center p-1"
                    >
                        {openFolders.has("projects-root") ? <ChevronDown className="h-4 w-4 text-gray-500"/> : <ChevronRight className="h-4 w-4 text-gray-500"/>}
                    </button>
                </div>
             </div>
             {openFolders.has("projects-root") && (
                 <FolderTree items={projectItems} openFolders={openFolders} toggleFolder={toggleFolder} />
             )}
         </div>

        {/* Static section examples from SidebarNew (Optional) */}
        <div className="mb-1">
          <button className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-black">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4" />
              <span>Reminders</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </nav>
      {/* Bottom section - theme toggle (Visual only for now if context not avail) */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors bg-white text-black shadow-sm",
            )}
          >
            <Sun className="h-4 w-4" />
            Light
          </button>
          <button
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-gray-500",
            )}
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>
        </div>
      </div>
    </aside>
  );
}
