"use client";

import { useEffect, useRef } from "react";
import { Client } from "appwrite";

import { APPWRITE_ENDPOINT, PROJECT_ID, DATABASE_ID, CHAT_MESSAGES_ID } from "@/src/config";
import { useChatRealtimeToken } from "@/src/features/chat/api/use-chat-realtime-token";
import { useGetWorkspace } from "@/src/features/workspaces/api/use-get-workspace-id";
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
  const { data: workspace } = useGetWorkspace({
    workspaceId: workspaceId ?? "",
    enabled: !!workspaceId,
  });
  const { data } = useChatRealtimeToken(enabled && !!workspaceId);
  const onMessageRef = useRef(onMessage);
  const debug =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CHAT_REALTIME_DEBUG === "true";
  const resolvedWorkspaceId = workspace?.$id ?? workspaceId;

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !workspaceId) return;
    if (!data?.jwt) return;
    if (debug) {
      console.info("[chat-realtime] subscribe", {
        workspaceId,
        resolvedWorkspaceId: resolvedWorkspaceId ?? null,
        projectId: projectId ?? null,
        channel: `databases.${DATABASE_ID}.collections.${CHAT_MESSAGES_ID}.documents`,
      });
    }

    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(PROJECT_ID)
      .setJWT(data.jwt);

    const channel = `databases.${DATABASE_ID}.collections.${CHAT_MESSAGES_ID}.documents`;

    let unsubscribe = () => {};
    try {
      unsubscribe = client.subscribe(channel, (event) => {
        const isCreate = event.events?.some((name) => name.endsWith(".create"));
        const payload = event.payload as ChatMessage;

        if (debug) {
          console.info("[chat-realtime] event", {
            events: event.events ?? [],
            messageId: payload?.$id ?? null,
            workspaceId: payload?.workspaceId ?? null,
            projectId: payload?.projectId ?? null,
            isCreate,
          });
        }

        if (!isCreate) return;
        if (payload.workspaceId !== resolvedWorkspaceId) {
          if (debug) {
            console.info("[chat-realtime] skip-workspace", {
              payloadWorkspaceId: payload.workspaceId,
              resolvedWorkspaceId: resolvedWorkspaceId ?? null,
            });
          }
          return;
        }
        if (projectId && payload.projectId !== projectId) {
          if (debug) {
            console.info("[chat-realtime] skip-project", {
              payloadProjectId: payload.projectId ?? null,
              projectId,
            });
          }
          return;
        }

        if (debug) {
          console.info("[chat-realtime] message", {
            messageId: payload.$id,
            workspaceId: payload.workspaceId,
            projectId: payload.projectId ?? null,
          });
        }

        onMessageRef.current?.(payload, event);
      });
    } catch (error) {
      if (debug) {
        console.info("[chat-realtime] subscribe-error", error);
      }
    }

    return () => {
      unsubscribe();
      if (debug) {
        console.info("[chat-realtime] unsubscribe", {
          workspaceId,
          projectId: projectId ?? null,
        });
      }
    };
  }, [enabled, workspaceId, resolvedWorkspaceId, projectId, data?.jwt, debug]);
};
