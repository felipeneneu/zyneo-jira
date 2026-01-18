"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCurrent } from "@/src/features/auth/api/use-current";
import { useChatUnread } from "@/src/features/chat/api/use-chat-unread";
import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import { useChatRealtime } from "../hooks/use-chat-realtime";
import type { ChatMessage } from "../types";

const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return;
    const AudioContextCtor =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextCtor();
      }
      return audioContextRef.current;
    } catch (_error) {
      return;
    }
  }, []);

  const unlock = useCallback(() => {
    const context = getAudioContext();
    if (!context) return;
    if (context.state === "suspended") {
      context.resume().catch(() => null);
    }
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.01);
      unlockedRef.current = true;
    } catch (_error) {
      // Silencia erros de autoplay/AudioContext
    }
  }, [getAudioContext]);

  const play = useCallback(() => {
    if (!unlockedRef.current) return;
    const context = getAudioContext();
    if (!context) return;
    if (context.state === "suspended") {
      context.resume().catch(() => null);
    }
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;

      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.25);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.25);
    } catch (_error) {
      // Silencia erros de autoplay/AudioContext
    }
  }, [getAudioContext]);

  return { play, unlock };
};

export const ChatRealtimeNotifier = () => {
  const workspaceId = useWorkspaceId() as string | undefined;
  const { data: user } = useCurrent();
  const queryClient = useQueryClient();
  const lastMessageIdRef = useRef<string | null>(null);
  const { play, unlock } = useNotificationSound();
  const { data: unreadData } = useChatUnread(workspaceId, {
    enabled: !!workspaceId,
    refetchInterval: 15000,
  });
  const lastUnreadRef = useRef<{ count: number; lastMessageAt: string | null } | null>(
    null
  );

  const handleMessage = useCallback(
    (message: ChatMessage) => {
      if (!workspaceId) return;
      if (user?.$id && message.userId === user.$id) return;
      if (lastMessageIdRef.current === message.$id) return;

      lastMessageIdRef.current = message.$id;
      queryClient.invalidateQueries({
        queryKey: ["chat", "unread", workspaceId],
      });
      play();
    },
    [play, queryClient, user?.$id, workspaceId]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      if ("isTrusted" in event && !event.isTrusted) return;
      unlock();
    };
    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    window.addEventListener("touchstart", handler, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, [unlock]);

  useEffect(() => {
    const count =
      (unreadData && "count" in unreadData ? unreadData.count : 0) ??
      (unreadData?.unread ? 1 : 0);
    const lastMessageAt = unreadData?.lastMessageAt ?? null;

    if (!lastUnreadRef.current) {
      lastUnreadRef.current = { count, lastMessageAt };
      return;
    }

    const previous = lastUnreadRef.current;
    lastUnreadRef.current = { count, lastMessageAt };

    if (!previous.lastMessageAt || !lastMessageAt) return;
    if (lastMessageAt === previous.lastMessageAt) return;
    if (count > previous.count) {
      play();
    }
  }, [play, unreadData]);

  useChatRealtime({
    workspaceId,
    enabled: !!workspaceId,
    onMessage: handleMessage,
  });

  return null;
};
