"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ScrollArea } from "@/src/ui/scroll-area";
import { Button } from "@/src/ui/button";

import { useGetChatMessages } from "../api/use-get-chat-messages";
import { useMarkChatRead } from "../api/use-mark-chat-read";
import { useSendChatMessage } from "../api/use-send-chat-message";
import { useChatRealtime } from "../hooks/use-chat-realtime";
import { ChatInput } from "./chat-input";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";

interface WorkspaceChatProps {
  workspaceId: string;
}

export const WorkspaceChat = ({ workspaceId }: WorkspaceChatProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useGetChatMessages({ workspaceId, limit: 50 });

  const { mutate: markRead } = useMarkChatRead();
  const { mutate: sendMessage, isPending: isSending } = useSendChatMessage();

  const messages = useMemo(() => {
    const pages = data?.pages ?? [];
    const docs = pages.flatMap((p) => p.documents);
    return [...docs].reverse(); // server is orderDesc
  }, [data]);

  const handleRealtimeMessage = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["chat", "messages", workspaceId],
    });
    queryClient.invalidateQueries({
      queryKey: ["chat", "unread", workspaceId],
    });
    markRead({ json: { workspaceId } });
  }, [markRead, queryClient, workspaceId]);

  useChatRealtime({
    workspaceId,
    onMessage: handleRealtimeMessage,
  });

  useEffect(() => {
    markRead({ json: { workspaceId } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const viewport = root.querySelector("[data-slot=\"scroll-area-viewport\"]") as HTMLDivElement | null;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  const onSend = useCallback(
    (payload: { text: string; lexical: string }) => {
      const body = payload.text.trim();
      if (!body) return;

      sendMessage(
        {
          json: {
            workspaceId,
            body,
            bodyLexical: payload.lexical || undefined,
          },
        },
        {
          onSuccess: () => {
            markRead({ json: { workspaceId } });
          },
        }
      );
    },
    [markRead, sendMessage, workspaceId]
  );

  return (
    <div className="flex flex-col min-h-0 max-h-[calc(100dvh-12rem)] border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b">
        <div className="text-sm font-medium">Chat</div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0">
      <ScrollArea className="h-full p-4">
        <div className="space-y-3">
          {messages.map((m) => {
            const fallback = (m.senderName?.[0] ?? "U").toUpperCase();
            return (
              <div key={m.$id} className="flex gap-3">
                <Avatar className="size-8 border border-neutral-300">
                  {m.senderAvatarUrl ? (
                    <AvatarImage src={m.senderAvatarUrl} alt={m.senderName} />
                  ) : null}
                  <AvatarFallback className="bg-neutral-200 text-neutral-600">
                    {fallback}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold truncate">{m.senderName}</span>
                    <span className="text-xs text-muted-foreground">{new Date(m.$createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                </div>
              </div>
            );
          })}

          {hasNextPage ? (
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                Load older
              </Button>
            </div>
          ) : null}
        </div>
      </ScrollArea>
      </div>

      <div className="p-3 border-t">
        <ChatInput
          onSend={onSend}
          disabled={isSending}
          placeholder="Digite sua mensagem..."
          maxLength={2000}
        />
      </div>
    </div>
  );
};
