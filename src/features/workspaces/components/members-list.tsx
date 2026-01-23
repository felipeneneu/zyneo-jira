"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/ui/card";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { Button } from "@/src/ui/button";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { useGetMembers } from "../../members/api/use-get-members";
import { Fragment } from "react/jsx-runtime";
import { MembersAvatar } from "../../members/components/members-avatar";
import { Separator } from "@/src/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/ui/dropdown-menu";
import { useDeleteMember } from "../../members/api/use-delete-member";
import { useUpdateMember } from "../../members/api/use-update-member";
import { MemberRole } from "../../members/types";
import { useConfirm } from "@/src/hooks/use-confirm";

export const MemberList = () => {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "This member will be remove from the workspace",
    "destructive"
  );

  const { data } = useGetMembers({ workspaceId });

  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      json: { role },
      param: { memberId },
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
  };

  const linkBack: string = `/workspaces/${workspaceId}`;
  return (
    <Card className="w-full h-full shadow-none border-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button
          size={"sm"}
          variant={"secondary"}
          className="cursor-pointer"
          asChild
        >
          <Link href={linkBack}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Lista de Membros</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        {data?.documents.map((member, index) => (
          <Fragment key={member.$id}>
            <div className="flex items-center gap-2">
              <MembersAvatar
                name={member.name}
                avatarUrl={member.avatarUrl}
                fallbackClassName="text-lg"
                className="size-10"
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  {member.email}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="ml-auto"
                    variant={"secondary"}
                    size={"icon"}
                  >
                    <MoreVerticalIcon className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuItem
                    className="font-medium"
                    onClick={() =>
                      handleUpdateMember(member.$id, MemberRole.ADMIN)
                    }
                    disabled={isUpdatingMember}
                  >
                    Promover a Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium"
                    onClick={() =>
                      handleUpdateMember(member.$id, MemberRole.MEMBER)
                    }
                    disabled={isUpdatingMember}
                  >
                    Promover a Membro
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium text-amber-700"
                    onClick={() => handleDeleteMember(member.$id)}
                    disabled={isDeletingMember}
                  >
                    Remover {member.name}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {index < data.documents.length - 1 && (
              <Separator className="my-2.5 text-neutral-300" />
            )}
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
};
