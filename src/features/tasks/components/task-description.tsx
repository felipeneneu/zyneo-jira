"use client";
import { useState } from "react";
import { Loader2Icon, PencilIcon, SparklesIcon, XIcon } from "lucide-react";
import { Task } from "../types";
import { Button } from "@/src/ui/button";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { useUpdateTask } from "../api/use-update-task";
import { Textarea } from "@/src/ui/textarea";
import { useGenerateTaskDescription } from "../api/use-generate-task-description";
import ReactMarkdown from "react-markdown";

interface TaskDescriptionProps {
  task: Task;
}
export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.description ?? "");
  const AI_NAME = "Echo AI";

  const { mutate, isPending } = useUpdateTask();

  const { mutate: generate, isPending: isGenerating } =
    useGenerateTaskDescription();

  const handleSave = () => {
    mutate(
      {
        json: { description: value },
        param: { taskId: task.$id },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleToggleEditing = () => {
    if (isEditing) {
      setIsEditing(false);
      setValue(task.description ?? "");
      return;
    }

    setValue(task.description ?? "");
    setIsEditing(true);
  };

  const handleGenerate = () => {
    generate(
      {
        param: { taskId: task.$id },
      },
      {
        onSuccess: ({ data }) => {
          setValue(data.text);
          setIsEditing(true);
        },
      }
    );
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>
        <Button
          size={"sm"}
          variant={"secondary"}
          onClick={handleToggleEditing}
        >
          {isEditing ? (
            <XIcon className="size-4 mr-2" />
          ) : (
            <PencilIcon className="size-4 mr-2" />
          )}
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>
      <DottedSeparator className="my-4" />
      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Add a description..."
            value={value}
            rows={4}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
          />
          <div className="flex justify-center items-center gap-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleGenerate}
              disabled={isPending || isGenerating}
              className="w-fit ml-auto"
            >
              {isGenerating ? (
                <Loader2Icon className="size-4 mr-2 animate-spin" />
              ) : (
                <SparklesIcon className="size-4 mr-2" />
              )}
              Ask {AI_NAME}
            </Button>
            <Button
              size={"sm"}
              className="w-fit"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Change"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          {value?.trim() ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <span className="text-muted-foreground">No description set</span>
          )}
        </div>
      )}
    </div>
  );
};
