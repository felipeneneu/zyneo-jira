"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ScrollArea } from "@/src/ui/scroll-area";
import { Input } from "@/src/ui/input";
import { Button } from "@/src/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/select";

import { useGetProjects } from "@/src/features/projects/api/use-get-projects";

import { useGetChatMessages } from "../api/use-get-chat-messages";
import { useMarkChatRead } from "../api/use-mark-chat-read";
import { useSendChatMessage } from "../api/use-send-chat-message";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";

interface WorkspaceChatProps {
  workspaceId: string;
  defaultProjectId?: string | null;
}

export const WorkspaceChat = ({
  workspaceId,
  defaultProjectId,
}: WorkspaceChatProps) => {
  const [message, setMessage] = useState("");
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId ?? null);

  const containerRef = useRef<HTMLDivElement>(null);

  const { data: projects } = useGetProjects({ workspaceId });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useGetChatMessages({ workspaceId, projectId, limit: 50 });

  const { mutate: markRead } = useMarkChatRead();
  const { mutate: sendMessage, isPending: isSending } = useSendChatMessage();

  const projectOptions = useMemo(() => {
    const docs = projects?.documents ?? [];
    return docs.map((project) => ({ value: project.$id, label: project.name }));
  }, [projects]);

  const messages = useMemo(() => {
    const pages = data?.pages ?? [];
    const docs = pages.flatMap((p) => p.documents);
    return [...docs].reverse(); // server is orderDesc
  }, [data]);

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
    }, 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    const body = message.trim();
    if (!body) return;

    sendMessage(
      {
        json: {
          workspaceId,
          projectId: projectId ?? undefined,
          body,
        },
      },
      {
        onSuccess: () => {
          setMessage("");
          markRead({ json: { workspaceId } });
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-[65vh] border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b">
        <div className="text-sm font-medium">Chat</div>
        <div className="ml-auto w-[240px]">
          <Select
            value={projectId ?? "all"}
            onValueChange={(v) => setProjectId(v === "all" ? null : v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All projects</SelectItem>
              {projectOptions.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div ref={containerRef} className="flex-1">
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

      <form onSubmit={onSend} className="p-3 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isSending}
        />
        <Button type="submit" disabled={isSending || !message.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
};
