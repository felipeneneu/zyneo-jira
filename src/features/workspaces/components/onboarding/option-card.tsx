import { cn } from "@/src/lib/utils";
import React from "react";
import { FaCheck } from "react-icons/fa6";

interface OptionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick: () => void;
  className?: string;
  iconColor?: string;
  disabled?: boolean;
  disabledHint?: string;
}

export function OptionCard({
  title,
  description,
  icon,
  selected,
  onClick,
  className,
  iconColor,
  disabled,
  disabledHint,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-left transition-all hover:border-gray-600 outline-none focus:ring-2 focus:ring-purple-500/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-gray-700",
        selected && !disabled && "border-purple-500 bg-purple-500/10",
        className
      )}
      disabled={disabled}
    >
      <div className={cn("text-xl", iconColor || "text-white")}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-300 truncate group-hover:text-gray-100 transition-colors">
            {title}
        </div>
        {description && <div className="text-xs text-gray-500 mt-0.5 truncate">{description}</div>}
      </div>

      {disabled && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 px-2 py-1 rounded-full border border-dashed border-gray-700">
          {disabledHint || "Em breve"}
        </span>
      )}

      <div
        className={cn(
          "h-5 w-5 rounded-full border-2 border-gray-600 transition-all flex items-center justify-center flex-shrink-0",
          selected && "border-purple-500 bg-purple-500"
        )}
      >
        {selected && !disabled && <FaCheck className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}
