"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Star,
  Bell,
  AlertTriangle,
  Clock,
  AtSign,
  MessageSquare,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/ui/button";
import { Textarea } from "@/src/ui/textarea";
import { MembersAvatar } from "@/src/features/members/components/members-avatar";
import { useMarkNotificationRead, useToggleNotificationStar } from "@/src/features/notifications/api/use-notification-actions";
import { useCreateComment } from "@/src/features/comments/api/use-create-comment";
import type { Notification } from "@/src/features/notifications/types";

interface NotificationModalProps {
  notification: Notification;
  onClose: () => void;
}

const getReasonText = (type: Notification["type"]) => {
  switch (type) {
    case "system.stale":
      return "Esta tarefa está sem atividade há mais de 48 horas e está marcada como em progresso ou revisão.";
    case "system.overdue":
      return "Esta tarefa passou da data de entrega prevista e ainda não foi concluída.";
    case "human.mention":
      return "Alguém mencionou você em um comentário desta tarefa.";
    default:
      return "Notificação do sistema.";
  }
};

const getSuggestionText = (type: Notification["type"]) => {
  switch (type) {
    case "system.stale":
      return "Considere adicionar uma atualização de progresso ou marcar como bloqueada se estiver aguardando algo.";
    case "system.overdue":
      return "Revise a prioridade desta tarefa ou ajuste a data de entrega se necessário.";
    case "human.mention":
      return "Responda ao comentário para manter a equipe alinhada.";
    default:
      return "";
  }
};

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "system.stale":
      return <Clock className="size-5 text-amber-500" />;
    case "system.overdue":
      return <AlertTriangle className="size-5 text-red-500" />;
    case "human.mention":
      return <AtSign className="size-5 text-blue-500" />;
    default:
      return <Bell className="size-5 text-gray-500" />;
  }
};

export function NotificationModal({
  notification,
  onClose,
}: NotificationModalProps) {
  const router = useRouter();
  const [replyContent, setReplyContent] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const markRead = useMarkNotificationRead();
  const toggleStar = useToggleNotificationStar();
  const createComment = useCreateComment();

  const handleMarkReadAndClose = () => {
    if (!notification.readAt) {
      markRead.mutate(notification.$id);
    }
    onClose();
  };

  const handleOpenTask = () => {
    handleMarkReadAndClose();
    router.push(`/workspaces/${notification.workspaceId}/tasks/${notification.entityId}`);
  };

  const handleWorkingOnIt = async () => {
    await createComment.mutateAsync({
      taskId: notification.entityId,
      type: "progress",
      content: "Estou trabalhando nesta tarefa.",
    });
    handleMarkReadAndClose();
  };

  const handleBlocked = async () => {
    await createComment.mutateAsync({
      taskId: notification.entityId,
      type: "blocked",
      content: "Esta tarefa está bloqueada.",
    });
    handleMarkReadAndClose();
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    await createComment.mutateAsync({
      taskId: notification.entityId,
      type: "comment",
      content: replyContent,
    });
    setReplyContent("");
    setShowReplyInput(false);
    handleMarkReadAndClose();
  };

  const handleReplanDate = () => {
    // Navigate to task with date picker focus (simplified - just open task)
    handleOpenTask();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            {notification.type === "human.mention" ? (
              <MembersAvatar
                name={notification.title.split(" ")[0] || "U"}
                className="size-10"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                {getIcon(notification.type)}
              </div>
            )}
            <div>
              <p className="font-semibold text-black">{notification.title}</p>
              <p className="text-xs text-gray-400">
                {notification.type.replace(".", " • ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleStar.mutate(notification.$id)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  notification.starredAt && "fill-yellow-400 text-yellow-400"
                )}
              />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Snippet */}
          <p className="text-sm text-gray-700">{notification.snippet}</p>

          {/* Why you got this */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Por que você recebeu isso
            </p>
            <p className="text-sm text-gray-600">{getReasonText(notification.type)}</p>
          </div>

          {/* Copilot suggestion */}
          {getSuggestionText(notification.type) && (
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
              <p className="text-xs font-medium text-blue-600 uppercase mb-1">
                💡 Sugestão
              </p>
              <p className="text-sm text-blue-700">
                {getSuggestionText(notification.type)}
              </p>
            </div>
          )}

          {/* Reply input for mentions */}
          {showReplyInput && (
            <div className="space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Digite sua resposta..."
                className="min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyInput(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || createComment.isPending}
                >
                  Enviar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 px-6 py-4">
          {notification.type === "system.stale" && (
            <>
              <Button
                onClick={handleWorkingOnIt}
                disabled={createComment.isPending}
                className="gap-2"
              >
                <MessageSquare className="size-4" />
                Estou trabalhando
              </Button>
              <Button
                variant="outline"
                onClick={handleBlocked}
                disabled={createComment.isPending}
              >
                Bloqueada
              </Button>
            </>
          )}

          {notification.type === "system.overdue" && (
            <>
              <Button onClick={handleReplanDate} className="gap-2">
                <Calendar className="size-4" />
                Replanejar data
              </Button>
              <Button
                variant="outline"
                onClick={handleWorkingOnIt}
                disabled={createComment.isPending}
              >
                Adicionar update
              </Button>
            </>
          )}

          {notification.type === "human.mention" && (
            <Button
              onClick={() => setShowReplyInput(true)}
              className="gap-2"
              disabled={showReplyInput}
            >
              <MessageSquare className="size-4" />
              Responder
            </Button>
          )}

          <Button variant="ghost" onClick={handleOpenTask} className="gap-2 ml-auto">
            <ExternalLink className="size-4" />
            Abrir tarefa
          </Button>
        </div>
      </div>
    </div>
  );
}
