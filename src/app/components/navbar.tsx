"use client";
import { UserButton } from "@/src/features/auth/components/user-button";
import { MobileSidebar } from "./mobile-sidebar";
import { usePathname } from "next/navigation";

const pathnameMap = {
  tasks: {
    title: "Minhas Tarefas",
    description: "Visualize todas as suas tarefas aqui.",
  },
  projects: {
    title: "Meu Projeto",
    description: "Visualize as tarefas do seu projeto aqui.",
  },
  chat: {
    title: "Chat",
    description: "Converse com o time do workspace aqui.",
  },
};

const defaultMap = {
  title: "Início",
  description: "Acompanhe todos os seus projetos e tarefas aqui.",
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar />
      <UserButton />
    </nav>
  );
};
