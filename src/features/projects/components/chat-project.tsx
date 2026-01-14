"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";

import {
  Menu,
  Hash,
  Star,
  Users,
  Info,
  Send,
  Plus,
  Smile,
  AtSign,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/src/ui/button";
import { Task } from "../../tasks/types";
import { MembersAvatar } from "../../members/components/members-avatar";
import { Input } from "@/src/ui/input";
import { ScrollArea } from "@/src/ui/scroll-area";

interface Message {
  id: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
}

interface ChatAreaProps {
  data: Task[];
}

export function ChatArea({ data }: ChatAreaProps) {
  const firstTask = data[0];
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      user: firstTask?.assignee?.name || "Maria Silva",
      avatar: firstTask?.assignee?.name || "", // <--- Aqui pegamos a URL da imagem
      content: "Olá pessoal! Como estão os projetos de hoje?",
      time: "09:15",
      reactions: [{ emoji: "👍", count: 3 }],
    },
    {
      id: "2",
      user: firstTask?.assignee?.name || "Maria Silva",
      avatar: firstTask?.assignee?.name || "", // <--- Aqui pegamos a URL da imagem
      content: "Olá pessoal! Como estão os projetos de hoje?",
      time: "09:15",
      reactions: [{ emoji: "👍", count: 3 }],
    },
  ]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      user: "Você",
      avatar: "/placeholder.svg?height=40&width=40",
      content: message,
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => {}}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h1 className="font-semibold text-lg">{data[0].project?.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Star className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="group flex gap-3 hover:bg-muted/50 -mx-2 px-2 py-1 rounded"
            >
              <MembersAvatar name={msg.user} fallbackClassName="text-[10px]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">{msg.user}</span>
                  <span className="text-xs text-muted-foreground">
                    {msg.time}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mt-0.5">
                  {msg.content}
                </p>
                {msg.reactions && (
                  <div className="flex gap-1 mt-1">
                    {msg.reactions.map((reaction, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs gap-1 hover:bg-accent bg-transparent"
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="relative rounded-lg border border-input bg-background focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Mensagem para #${data[0].project?.name}`}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-32 resize-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <AtSign className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>
              <strong>Enter</strong> para enviar
            </span>
            <span>•</span>
            <span>
              <strong>Shift + Enter</strong> para nova linha
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
