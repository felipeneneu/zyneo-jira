"use client";

import * as React from "react";

import { cn } from "@/src/lib/utils";

type KbdProps = React.HTMLAttributes<HTMLElement>;

const Kbd = ({ className, ...props }: KbdProps) => {
  return (
    <kbd
      className={cn(
        "inline-flex items-center rounded border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
};

const KbdGroup = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} {...props} />
  );
};

export { Kbd, KbdGroup };
