"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarCheck2,
  ClipboardList,
  FileText,
  GitPullRequest,
  LayoutGrid,
  LineChart,
  ShieldCheck,
} from "lucide-react";

import { useWorkspaceId } from "@/src/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspace } from "@/src/features/workspaces/api/use-get-workspace-id";
import { getWorkspacePreset } from "@/src/features/workspaces/domain/workspace-presets";
import { Badge } from "@/src/ui/badge";
import { Button } from "@/src/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/ui/card";
import { ScrollArea, ScrollBar } from "@/src/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/ui/tabs";
import { AuditLogTable } from "./audit-log-table";
import { DiagramsBoard } from "./diagrams-board";

type DevTab = {
  value: string;
  label: string;
  capability?: string;
};

const DEV_TABS: DevTab[] = [
  { value: "overview", label: "Overview" },
  { value: "backlog", label: "Backlog", capability: "backlog" },
  { value: "sprints", label: "Sprints", capability: "sprints" },
  { value: "docs", label: "Docs", capability: "docs" },
  { value: "diagrams", label: "Diagrams", capability: "diagrams" },
  { value: "reports", label: "Reports", capability: "reports" },
  { value: "audit", label: "Audit", capability: "audit" },
  { value: "exports", label: "Exports", capability: "exports" },
];

const capabilityEnabled = (
  capabilities: string[] | undefined,
  capability?: string
) => {
  if (!capability) return true;
  return capabilities ? capabilities.includes(capability) : true;
};

export const DevWorkspace = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ workspaceId });
  const preset = getWorkspacePreset(workspace?.workspaceType);
  const capabilities = workspace?.capabilities ?? preset?.capabilities;

  const visibleTabs = DEV_TABS.filter((tab) =>
    capabilityEnabled(capabilities, tab.capability)
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase text-muted-foreground">Dev Hub</p>
            <h1 className="text-2xl font-semibold">
              {workspace?.name ?? "Workspace"}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">SOFTWARE DEV</Badge>
              <Badge variant="outline">WORKSPACE ACTIVE</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg" className="gap-2">
              <Link href={`/workspaces/${workspaceId}/tasks`}>
                <ClipboardList className="size-4" />
                Open tasks
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href={`/workspaces/${workspaceId}/projects`}>
                <LayoutGrid className="size-4" />
                Projects
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={visibleTabs[0]?.value ?? "overview"}>
        <ScrollArea className="w-full">
          <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0">
            {visibleTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="min-h-11 rounded-full border px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-white"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarCheck2 className="size-4" />
                  Active sprint
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Sprint 12 · 2026-01-08 to 2026-01-22
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitPullRequest className="size-4" />
                  Pull requests
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Connect GitHub to list active PRs here.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LineChart className="size-4" />
                  Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Velocity and throughput cards will live here.
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backlog" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Backlog focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Keep ideas and planned work organized by priority.</p>
              <Button asChild size="lg" variant="secondary">
                <Link href={`/workspaces/${workspaceId}/tasks`}>Open backlog</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sprints" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sprint cadence</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Plan start/end dates and goals for each sprint.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming sprint</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Sprint 13 · Ready to schedule
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-4" />
                Docs workspace
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Write architecture notes, runbooks, and ADRs linked to tasks.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagrams" className="mt-6">
          <DiagramsBoard />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="size-4" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Weekly delivery, cycle time, and team health snapshots.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  Audit log
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Track changes across tasks, sprints, and releases.
              </CardContent>
            </Card>
            <AuditLogTable />
          </div>
        </TabsContent>

        <TabsContent value="exports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4" />
                Exports
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="lg" variant="secondary">
                Export tasks (CSV)
              </Button>
              <Button size="lg" variant="secondary">
                Export tasks (PDF)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
