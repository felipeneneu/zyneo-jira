"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Send,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/ui/button";
import { Textarea } from "@/src/ui/textarea";
import { MembersAvatar } from "@/src/features/members/components/members-avatar";
import { useGetComments } from "../api/use-get-comments";
import { useCreateComment } from "../api/use-create-comment";
import type { CommentType, TaskComment } from "../types";

interface TaskCommentsProps {
  taskId: string;
}

const commentTypeConfig: Record<
  CommentType,
  { icon: React.ReactNode; label: string; bgColor: string }
> = {
  comment: {
    icon: <MessageSquare className="size-4" />,
    label: "Comentário",
    bgColor: "bg-gray-100",
  },
  progress: {
    icon: <CheckCircle className="size-4 text-green-600" />,
    label: "Progresso",
    bgColor: "bg-green-50",
  },
  blocked: {
    icon: <AlertTriangle className="size-4 text-red-600" />,
    label: "Bloqueado",
    bgColor: "bg-red-50",
  },
  decision: {
    icon: <HelpCircle className="size-4 text-blue-600" />,
    label: "Decisão",
    bgColor: "bg-blue-50",
  },
};

export function TaskComments({ taskId }: TaskCommentsProps) {
  const [content, setContent] = useState("");
  const [selectedType, setSelectedType] = useState<CommentType>("comment");

  const { data, isLoading } = useGetComments({ taskId });
  const createComment = useCreateComment();

  const comments = data?.documents ?? [];

  const handleSubmit = async () => {
    if (!content.trim()) return;

    await createComment.mutateAsync({
      taskId,
      type: selectedType,
      content: content.trim(),
    });

    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">
        Atividade / Comentários
      </h3>

      {/* Composer */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        {/* Type selector */}
        <div className="flex gap-2">
          {(Object.keys(commentTypeConfig) as CommentType[]).map((type) => {
            const config = commentTypeConfig[type];
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedType === type
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {config.icon}
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Input */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Adicione um comentário... (use @[nome](id) para mencionar)"
          className="min-h-[80px] resize-none"
        />

        {/* Submit */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400">Cmd+Enter para enviar</p>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || createComment.isPending}
            className="gap-2"
          >
            <Send className="size-4" />
            Enviar
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum comentário ainda</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

            {comments.map((comment, index) => (
              <CommentItem
                key={comment.$id}
                comment={comment}
                isLast={index === comments.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  isLast,
}: {
  comment: TaskComment;
  isLast: boolean;
}) {
  const config = commentTypeConfig[comment.type];

  return (
    <div className="relative flex gap-4 pb-4">
      {/* Avatar */}
      <div className="relative z-10">
        <MembersAvatar
          name={comment.authorName ?? "U"}
          className="size-10 ring-4 ring-white"
        />
      </div>

      {/* Content */}
      <div className={cn("flex-1 rounded-lg p-3", config.bgColor)}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            {comment.authorName ?? "Usuário"}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
              config.bgColor === "bg-gray-100"
                ? "bg-gray-200"
                : config.bgColor.replace("50", "100")
            )}
          >
            {config.icon}
            {config.label}
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            {formatDistanceToNow(new Date(comment.$createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
