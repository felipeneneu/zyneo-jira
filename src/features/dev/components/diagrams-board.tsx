"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/ui/card";
import { Button } from "@/src/ui/button";
import { ScrollArea } from "@/src/ui/scroll-area";
import { FilePlus2, Layers } from "lucide-react";

const defaultDiagrams = [
  { id: "1", name: "Auth Flow", updatedAt: "Today" },
  { id: "2", name: "Sprint Plan", updatedAt: "Yesterday" },
  { id: "3", name: "Release Pipeline", updatedAt: "2d ago" },
];

interface DiagramsBoardProps {
  items?: { id: string; name: string; updatedAt: string }[];
}

export const DiagramsBoard = ({ items = defaultDiagrams }: DiagramsBoardProps) => {
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Diagram Board</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="size-4" />
            A shared space for architecture and flows.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" className="gap-2">
              <FilePlus2 className="size-4" />
              New diagram
            </Button>
            <Button size="lg" variant="secondary">
              Open board
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent diagrams</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[260px]">
            <div className="space-y-3">
              {items.map((diagram) => (
                <div
                  key={diagram.id}
                  className="flex items-center justify-between rounded-md border bg-white p-3"
                >
                  <div>
                    <p className="font-medium">{diagram.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {diagram.updatedAt}
                    </p>
                  </div>
                  <Button size="lg" variant="outline">
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
