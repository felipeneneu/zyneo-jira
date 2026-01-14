import React from "react";

interface WizardStepLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

export function WizardStepLayout({
  title,
  description,
  children,
  headerContent
}: WizardStepLayoutProps) {
  // Navigation is now handled by the parent container (grid footer)
  return (
    <div className="flex flex-col h-full w-full animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header Area */}
      <div className="mb-6 md:mb-8 flex-shrink-0">
        {headerContent && <div className="mb-6">{headerContent}</div>}
        <h1 className="mb-4 text-2xl md:text-3xl font-bold text-white text-balance leading-tight">
          {title}
        </h1>
        {description && (
             <p className="text-sm text-gray-400 max-w-xl">{description}</p>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
