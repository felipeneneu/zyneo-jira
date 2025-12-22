"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/src/ui/sheet";
import { MenuIcon } from "lucide-react";
import { Sidebar } from "./sidebar";

import { usePathname } from "next/navigation";

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size={"icon"} variant="secondary" className="lg:hidden">
          <MenuIcon className="size-5 text-neutral-500" />
        </Button>
      </SheetTrigger>
      <SheetTitle className="hidden">Menu</SheetTitle>
      <SheetContent side="left" className="p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
