"use client";

import { Button } from "@/src/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/ui/card";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useInviteCode } from "../hooks/use-invite-code";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface JoinWorkspaceFormProps {
  initialValues: {
    name: string;
    slug?: string;
  };
}

export const JoinWorkspaceForm = ({
  initialValues,
}: JoinWorkspaceFormProps) => {
  const router = useRouter();

  const workspaceId = useWorkspaceId();
  const inviteCode = useInviteCode();
  const { mutate, isPending } = useJoinWorkspace();

  const onSubmit = () => {
    mutate(
      {
        param: { workspaceId },
        json: { code: inviteCode },
      },
      {
        onSuccess: ({ data }) => {
          const slugOrId = data.slug ?? data.$id;
          router.push(`/workspaces/${slugOrId}`);
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold">Join Workspace</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join <strong>{initialValues.name}</strong>{" "}
          workspace
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <Button
            variant={"secondary"}
            type="button"
            asChild
            className="cursor-pointer w-full lg:w-fit"
            size={"lg"}
            disabled={isPending}
          >
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            className="cursor-pointer w-full lg:w-fit"
            size={"lg"}
            type="button"
            onClick={onSubmit}
            disabled={isPending}
          >
            Join workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
