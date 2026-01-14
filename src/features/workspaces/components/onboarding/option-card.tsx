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
}

export function OptionCard({ title, description, icon, selected, onClick, className, iconColor }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-left transition-all hover:border-gray-600 outline-none focus:ring-2 focus:ring-purple-500/50",
        selected && "border-purple-500 bg-purple-500/10",
        className
      )}
    >
      <div className={cn("text-xl", iconColor || "text-white")}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-300 truncate group-hover:text-gray-100 transition-colors">
            {title}
        </div>
        {description && <div className="text-xs text-gray-500 mt-0.5 truncate">{description}</div>}
      </div>
      
      <div
        className={cn(
          "h-5 w-5 rounded-full border-2 border-gray-600 transition-all flex items-center justify-center flex-shrink-0",
          selected && "border-purple-500 bg-purple-500"
        )}
      >
        {selected && <FaCheck className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}
