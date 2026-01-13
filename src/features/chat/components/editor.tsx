"use client";
import Quill, { type QuillOptions } from "quill";
import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";

import "quill/dist/quill.snow.css";
import "./quill-edit.css";

import { useEffect, useRef } from "react";
import { Button } from "@/src/ui/button";
import { ImageIcon, Smile } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

export const Editor = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );

    const options: QuillOptions = {
      theme: "snow",
    };

    new Quill(editorContainer, options);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col border border-neutral-200 rounded-md overflow-hidden focus-within:border-neutral-300 focus-within:shadow-sm transition bg-white">
        <div ref={containerRef} className="h-full ql-custom" />

        <div className="flex px-2 pb-2 z-5 ">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={false}
                size={"icon-sm"}
                variant={"ghost"}
                onClick={() => {}}
              >
                <PiTextAa className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hide formatting</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={false}
                size={"icon-sm"}
                variant={"ghost"}
                onClick={() => {}}
              >
                <Smile className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Emoji</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={false}
                size={"icon-sm"}
                variant={"ghost"}
                onClick={() => {}}
              >
                <ImageIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Imagem</p>
            </TooltipContent>
          </Tooltip>
          <Button
            disabled={false}
            size={"icon-sm"}
            onClick={() => {}}
            className="ml-auto"
          >
            <MdSend className="size-4" />
          </Button>
        </div>
      </div>
      <div className="p-2 text-[12px] text-muted-foreground flex justify-end">
        <p>
          <strong>Shift + Return</strong> to add a new line
        </p>
      </div>
    </div>
  );
};
