"use client";
import { PlusIcon } from "lucide-react";

import { Button } from "@/src/ui/button";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/ui/tabs";

import { useCreateTaskModal } from "../hooks/use-create-task-modal";

export const TaskViewSwitcher = () => {
  const { open } = useCreateTaskModal();
  return (
    <Tabs className="flex-1 w-full border rounded-lg">
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
              Table
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="kaban">
              Kaban
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="calendar">
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button size={"sm"} className="w-full lg:w-auto" onClick={open}>
            <PlusIcon className="size-4 mr-2" />
            New
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        {/** Add Filters */}
        <DottedSeparator className="my-4" />

        <>
          <TabsContent value="table" className="mt-0">
            Data Table
          </TabsContent>
          <TabsContent value="kaban" className="mt-0">
            Kaban
          </TabsContent>
          <TabsContent value="calendar" className="mt-0">
            Calendar
          </TabsContent>
        </>
      </div>
    </Tabs>
  );
};
