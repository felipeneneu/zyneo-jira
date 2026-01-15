"use client";
import { cn } from "@/src/lib/utils";
import { Code2, MessageSquare, SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";

import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspace } from "@/src/features/workspaces/api/use-get-workspace-id";
import { getWorkspacePreset } from "@/src/features/workspaces/domain/workspace-presets";

const routes = [
  {
    label: "Início",
    href: "/",
    icon: GoHome,
    activeIcon: GoHomeFill,
    capability: "nav.home",
  },
  {
    label: "Minhas Tarefas",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
    capability: "nav.tasks",
  },
  {
    label: "Chat",
    href: "/chat",
    icon: MessageSquare,
    activeIcon: MessageSquare,
    capability: "nav.chat",
  },
  {
    label: "Dev Hub",
    href: "/dev",
    icon: Code2,
    activeIcon: Code2,
    capability: "nav.dev",
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
    capability: "nav.settings",
  },
  {
    label: "Membros",
    href: "/members",
    icon: UserIcon,
    activeIcon: UserIcon,
    capability: "nav.members",
  },
];

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const { data: workspace } = useGetWorkspace({ workspaceId });
  const preset = getWorkspacePreset(workspace?.workspaceType);
  const capabilities = workspace?.capabilities ?? preset?.capabilities;
  const visibleRoutes = capabilities
    ? routes.filter((route) => capabilities.includes(route.capability))
    : routes;
  return (
    <ul className="flex flex-col">
      {visibleRoutes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`;
        const isActive = pathname === fullHref;
        const Icon = isActive ? item.activeIcon : item.icon;
        return (
          <Link href={fullHref} key={item.href}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <Icon className="size-5 text-neutral-500" />
              {item.label}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};
