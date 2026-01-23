"use client";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/ui/card";
import { DottedSeparator } from "@/src/ui/dotted-separator";
import { Input } from "@/src/ui/input";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/ui/form";
import { registerSchema } from "../schemas";
import { useRegister } from "../api/use-register";

// type Props = {};
export const SignUpCard = () => {
  const { mutate, isPending } = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    mutate({ json: values });
  };

  const handleOAuthClick = (provider: "google" | "github") => {
    // Redireciona para a API route que inicia o OAuth
    window.location.href = `/api/oauth/${provider}`;
  };

  return (
    <div>
      <Card className="w-full h-full md:w-[487px] border-none shadow-none">
        <CardHeader className="flex flex-col items-center justify-center text-center p-7">
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Ao se cadastrar, você concorda com nossas{" "}
            <Link href="/privacy">
              <span className="text-blue-700">Política de Privacidade</span>
            </Link>{" "}
            e{" "}
            <Link href="/terms">
              <span className="text-blue-700">Termos de Serviço</span>
            </Link>
          </CardDescription>
        </CardHeader>
        <div className="px-7 mb-2">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        type="text"
                        placeholder="Digite seu nome..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        type="email"
                        placeholder="Digite seu email..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        type="password"
                        placeholder="Digite sua senha..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isPending} size="lg" className="w-full">
                Registre-se
              </Button>
            </form>
          </Form>
        </CardContent>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7 flex flex-col gap-y-4">
          <Button
            disabled={isPending}
            variant={"secondary"}
            size="lg"
            className="w-full"
            onClick={() => handleOAuthClick("google")}
            type="button"
          >
            <FcGoogle className="mr-2 size-5" />
            Login com Google
          </Button>
          <Button
            disabled={isPending}
            variant={"secondary"}
            size="lg"
            className="w-full"
            onClick={() => handleOAuthClick("github")}
            type="button"
          >
            <FaGithub className="mr-2 size-5" />
            Login com Github
          </Button>
        </CardContent>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7 flex items-center justify-center">
          <p>
            Já tem uma conta?
            <Link href="/sign-in">
              <span className="text-blue-700">&nbsp;Entrar</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
