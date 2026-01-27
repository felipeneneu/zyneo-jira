"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { updateWorkspaceSchema } from "../schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/ui/form";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { Input } from "@/src/ui/input";
import { Button } from "@/src/ui/button";
import { Avatar, AvatarFallback } from "@/src/ui/avatar";
import Image from "next/image";
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { Workspace } from "../types";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { getAppwriteFileViewUrl } from "../hooks/get_appwrite-file-view-url";
import { useConfirm } from "@/src/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { toast } from "sonner";
import { useResetInviteCode } from "../api/use-reset-invite-code";

interface EditWorkspaceFormProps {
  onCancel?: () => void;
  initialValues: Workspace;
}

export const EditWorkspaceForm = ({
  onCancel,
  initialValues,
}: EditWorkspaceFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateWorkspace();
  const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } =
    useDeleteWorkspace();

  const { mutate: resetInviteCode, isPending: isResettingInviteCode } =
    useResetInviteCode();

  // Configuração dos diálogos de confirmação
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Excluir Espaço de Trabalho",
    "Tem certeza que deseja excluir este espaço de trabalho? Esta ação não pode ser desfeita.",
    "destructive",
  );

  const [ResetDialog, confirmReset] = useConfirm(
    "Redefinir link de convite",
    "Isso invalidará o link de convite atual. Tem certeza que deseja redefinir?",
    "destructive",
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema) as any,
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ? initialValues.imageUrl : "",
      description: initialValues.description ?? "",
    },
  });

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteWorkspace(
      {
        param: { workspaceId: initialValues.$id },
      },
      {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    );
  };

  const handleResetInviteCode = async () => {
    const ok = await confirmReset();
    if (!ok) return;
    resetInviteCode({
      param: { workspaceId: initialValues.$id },
    });
  };

  const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    };
    mutate({ form: finalValues, param: { workspaceId: initialValues.$id } });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  const slugOrId = initialValues.slug ?? initialValues.$id;
  const fullInviteLink = `${window.location.origin}/workspaces/${slugOrId}/join/${initialValues.inviteCode}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard
      .writeText(fullInviteLink)
      .then(() =>
        toast.success("Link de convite copiado para a área de transferência"),
      );
  };

  return (
    <div className="flex flex-col gap-y-4">
      <DeleteDialog />
      <ResetDialog />

      {/* Formulário de Edição Principal */}
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button
            size={"sm"}
            variant={"secondary"}
            onClick={
              onCancel
                ? onCancel
                : () => router.push(`/workspaces/${initialValues.$id}`)
            }
            className="cursor-pointer"
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Voltar
          </Button>
          <CardTitle className="text-xl font-bold">
            {initialValues.name}
          </CardTitle>
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Espaço de Trabalho</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Insira o nome do workspace"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Curta</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Um breve contexto sobre este workspace"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <div className="flex flex-col gap-y-2">
                      <div className="flex items-center gap-x-5">
                        {field.value ? (
                          <div className="size-18 relative rounded-md overflow-hidden">
                            <Image
                              fill
                              className="object-cover"
                              src={
                                field.value instanceof File
                                  ? URL.createObjectURL(field.value)
                                  : field.value
                                    ? getAppwriteFileViewUrl(field.value)
                                    : ""
                              }
                              alt="Avatar do Workspace"
                            />
                          </div>
                        ) : (
                          <Avatar className="size-18">
                            <AvatarFallback>
                              <ImageIcon className="size-9 text-neutral-400" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col">
                          <p className="text-sm">Ícone do Espaço de Trabalho</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, SVG ou JPEG, máx 1MB
                          </p>
                          <input
                            className="hidden"
                            type="file"
                            ref={inputRef}
                            accept=".jpg, .png, .jpeg, .svg"
                            onChange={handleImageChange}
                            disabled={isPending}
                          />

                          {field.value ? (
                            <Button
                              type="button"
                              disabled={isPending}
                              variant={"destructive"}
                              size={"xs"}
                              className="w-fit mt-2 cursor-pointer"
                              onClick={() => {
                                field.onChange(null);
                                if (inputRef.current) {
                                  inputRef.current.value = "";
                                }
                              }}
                            >
                              Remover Imagem
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              disabled={isPending}
                              variant={"teritary"}
                              size={"xs"}
                              className="w-fit mt-2 cursor-pointer"
                              onClick={() => inputRef.current?.click()}
                            >
                              Upload de Imagem
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
              <DottedSeparator className="py-7" />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant={"secondary"}
                  onClick={onCancel}
                  size={"lg"}
                  disabled={isPending}
                  className={cn(!onCancel && "invisible")}
                >
                  Cancelar
                </Button>
                <Button type="submit" size={"lg"} disabled={isPending}>
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Seção de Convites */}
      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Convidar Membros</h3>
            <p className="text-sm text-muted-foreground">
              Use o link de convite para adicionar membros ao seu espaço de
              trabalho.
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-center gap-x-2">
                <Input disabled value={fullInviteLink} />
                <Button
                  onClick={handleCopyInviteLink}
                  variant={"secondary"}
                  className="size-12 border-neutral-200 border"
                >
                  <CopyIcon className="size-5" />
                </Button>
              </div>
            </div>
            <DottedSeparator className="py-7" />
            <Button
              className="mt-6 w-fit ml-auto cursor-pointer"
              size={"sm"}
              variant={"destructive"}
              type="button"
              disabled={isPending || isResettingInviteCode}
              onClick={handleResetInviteCode}
            >
              Redefinir link de convite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Zona de Perigo</h3>
            <p className="text-sm text-muted-foreground">
              Excluir um espaço de trabalho é irreversível e removerá todos os
              dados associados.
            </p>
            <DottedSeparator className="py-7" />
            <Button
              className="mt-6 w-fit ml-auto cursor-pointer"
              size={"sm"}
              variant={"destructive"}
              type="button"
              disabled={isPending || isDeletingWorkspace}
              onClick={handleDelete}
            >
              Excluir Espaço de Trabalho
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};