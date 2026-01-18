"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
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
import { ArrowLeftIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { Project } from "../types";
import { useUpdateProject } from "../api/use-update-project";
import { updateProjectSchema } from "../schemas";
import { useConfirm } from "@/src/hooks/use-confirm";
import { getAppwriteFileViewUrl } from "../../workspaces/hooks/get_appwrite-file-view-url";
import { useDeleteProject } from "../api/use-delete-project";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";

interface EditProjectFormProps {
  onCancel?: () => void;
  initialValues: Project;
}

export const EditProjectForm = ({
  onCancel,
  initialValues,
}: EditProjectFormProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useUpdateProject();
  const { mutate: deleteProject, isPending: isDeletingProject } =
    useDeleteProject();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Excluir Projeto",
    "Tem certeza que deseja excluir este projeto? Esta ação não poderá ser desfeita.",
    "destructive",
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ? initialValues.imageUrl : "",
    },
  });

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteProject(
      {
        param: { projectId: initialValues.$id },
      },
      {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    );
  };

  const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    };
    mutate({ form: finalValues, param: { projectId: initialValues.$id } });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <DeleteDialog />
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button
            size={"sm"}
            variant={"secondary"}
            onClick={
              onCancel
                ? onCancel
                : () =>
                    router.push(
                      `/workspaces/${workspaceId}/projects/${initialValues.$id}`,
                    )
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
                      <FormLabel>Nome do Projeto</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o nome do projeto"
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
                              alt="Avatar do Projeto"
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
                          <p className="text-sm">Ícone do Projeto</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, SVG ou JPEG, máx 1mb
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
                              Fazer Upload
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
              <div className="py-7">
                <DottedSeparator />
              </div>
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

      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Zona de Perigo</h3>
            <p className="text-sm text-muted-foreground">
              Excluir um projeto é uma ação irreversível e removerá todos os
              dados associados a ele.
            </p>
            <div className="py-7">
              <DottedSeparator />
            </div>
            <Button
              className="mt-6 w-fit ml-auto cursor-pointer"
              size={"sm"}
              variant={"destructive"}
              type="button"
              disabled={isPending || isDeletingProject}
              onClick={handleDelete}
            >
              Excluir Projeto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};