"use client";

import { useEffect, useRef } from "react";
import { Client } from "appwrite";

import { APPWRITE_ENDPOINT, PROJECT_ID, DATABASE_ID, CHAT_MESSAGES_ID } from "@/src/config";
import { useChatRealtimeToken } from "@/src/features/chat/api/use-chat-realtime-token";
import type { ChatMessage } from "@/src/features/chat/types";

interface UseChatRealtimeProps {
  workspaceId?: string;
  projectId?: string | null;
  enabled?: boolean;
  onMessage?: (message: ChatMessage, event: { events?: string[]; payload: unknown }) => void;
}

export const useChatRealtime = ({
  workspaceId,
  projectId,
  enabled = true,
  onMessage,
}: UseChatRealtimeProps) => {
  const { data } = useChatRealtimeToken(enabled && !!workspaceId);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !workspaceId) return;
    if (!data?.jwt) return;

    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(PROJECT_ID)
      .setJWT(data.jwt);

    const channel = `databases.${DATABASE_ID}.collections.${CHAT_MESSAGES_ID}.documents`;

    const unsubscribe = client.subscribe(channel, (event) => {
      const isCreate = event.events?.some((name) => name.endsWith(".create"));
      if (!isCreate) return;

      const payload = event.payload as ChatMessage;
      if (payload.workspaceId !== workspaceId) return;
      if (projectId && payload.projectId !== projectId) return;

      onMessageRef.current?.(payload, event);
    });

    return () => unsubscribe();
  }, [enabled, workspaceId, projectId, data?.jwt]);
};
