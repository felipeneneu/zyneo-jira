"use client";
import { useCurrent } from "@/src/features/auth/api/use-current";
import { UserButton } from "@/src/features/auth/components/user-button";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Calendar, Loader, Search } from "lucide-react";

const Header = () => {
  const { data: user, isLoading } = useCurrent();

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <header className="hidden md:block">
      <div className="flex items-center justify-between  px-6 py-6">
        <h1 className="text-xl font-normal">
          Bem-vindo de volta, <b> {user?.name} </b>
        </h1>
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-black">
            <Search className="h-5 w-5" />
          </button>
          <button className="text-gray-500 hover:text-black">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          <UserButton />
        </div>
      </div>
      <DottedSeparator className="" />
    </header>
  );
};

export default Header;
