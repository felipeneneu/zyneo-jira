"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { SparklesIcon, AlertTriangle, TrendingUp, CheckCircle, Clock } from "lucide-react";

import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import { useGetDailyFocus } from "@/src/features/notifications/api/use-get-daily-focus";
import { useMarkNotificationRead } from "@/src/features/notifications/api/use-notification-actions";
import { useRegenerateDailyFocus } from "@/src/features/notifications/api/use-regenerate-daily-focus";
import { Button } from "@/src/ui/button";
import { Card, CardContent } from "@/src/ui/card";
import { DottedSeparator } from "@/src/ui/dotted-separator";

interface FocusData {
  fallback?: boolean;
  summary: string;
  risks?: string[];
  todayFocus?: {
    title: string;
    description: string;
  };
  pending?: string[];
  trend?: string;
  humor?: string;
}

export const DailyFocusCard = () => {
  const workspaceId = useWorkspaceId();
  const { data, isLoading, isError } = useGetDailyFocus({ workspaceId });
  const markRead = useMarkNotificationRead();
  const regenerate = useRegenerateDailyFocus();

  const parsedContent = useMemo(() => {
    if (!data?.notification?.snippet) return null;
    const { snippet } = data.notification;

    try {
      const parsed = JSON.parse(snippet) as FocusData;
      // Basic validation to check if it looks like our schema
      if (parsed.summary && (parsed.todayFocus || parsed.pending)) {
        return { type: "json" as const, data: parsed };
      }
      return { type: "markdown" as const, content: snippet };
    } catch {
      return { type: "markdown" as const, content: snippet };
    }
  }, [data?.notification?.snippet]);

  if (!workspaceId || isError) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border bg-white">
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-amber-500" />
            <p className="text-lg font-semibold">Overview diário</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Gerando seu overview diário...
          </p>
        </CardContent>
      </Card>
    );
  }

  const notification = data?.notification;
  if (!notification || !parsedContent) {
    return (
      <Card className="border bg-white shadow-sm">
        <CardContent className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-amber-100 p-1.5">
              <SparklesIcon className="size-4 text-amber-600" />
            </div>
            <p className="text-lg font-semibold">Overview diário</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Crie ao menos 1 projeto e tenha 3 tarefas atribuídas para gerar o
            overview de hoje.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isUnread = !notification.readAt;

  const handleMarkRead = () => {
    if (!isUnread) return;
    markRead.mutate(notification.$id);
  };

  const renderContent = () => {
    if (parsedContent.type === "markdown") {
      return (
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <ReactMarkdown>{parsedContent.content}</ReactMarkdown>
        </div>
      );
    }

    const { data } = parsedContent;
    const shouldShowRetry =
      data.fallback === true ||
      data.trend === "Indisponível temporariamente" ||
      data.summary?.includes("IA");

    return (
      <div className="grid gap-6">
        {/* Humor / Intro */}
        {data.humor && (
          <div className="rounded-lg bg-blue-50/50 p-3 text-sm italic text-blue-700">
            &quot;{data.humor}&quot;
          </div>
        )}

        {shouldShowRetry && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-xs text-amber-700">
              A IA esta com limite de uso. Você pode tentar gerar novamente.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs"
              disabled={!workspaceId || regenerate.isPending}
              onClick={() => regenerate.mutate({ workspaceId })}
            >
              {regenerate.isPending ? "Gerando..." : "Tentar gerar de novo"}
            </Button>
          </div>
        )}

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Resumo Executivo
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.summary}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Focus - Highlighted */}
          {data.todayFocus && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="size-4 text-amber-600" />
                <h4 className="text-sm font-semibold text-amber-900">
                  Foco Principal
                </h4>
              </div>
              <p className="text-sm font-medium text-amber-900 mb-1">
                {data.todayFocus.title}
              </p>
              <p className="text-xs text-amber-700/80">
                {data.todayFocus.description}
              </p>
            </div>
          )}

          {/* Trend */}
          {data.trend && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Tendência
                </h4>
              </div>
              <p className="text-sm text-gray-600">{data.trend}</p>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Risks */}
          {data.risks && data.risks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-500" />
                <h4 className="text-sm font-semibold text-gray-900">Riscos</h4>
              </div>
              <ul className="list-inside list-disc text-sm text-red-600/90 space-y-1">
                {data.risks.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Pending / Stale */}
          {data.pending && data.pending.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Atenção Necessária
                </h4>
              </div>
              <ul className="list-inside list-disc text-sm text-gray-600 space-y-1">
                {data.pending.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="border bg-white shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-amber-100 p-1.5">
              <SparklesIcon className="size-4 text-amber-600" />
            </div>
            <p className="text-lg font-semibold">Overview diário</p>
            {isUnread && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 animate-pulse">
                Novo
              </span>
            )}
          </div>
          {isUnread && (
            <Button size="sm" variant="outline" className="text-xs h-8" onClick={handleMarkRead}>
              Marcar como lido
            </Button>
          )}
        </div>
        <DottedSeparator />
        
        {renderContent()}

      </CardContent>
    </Card>
  );
};
