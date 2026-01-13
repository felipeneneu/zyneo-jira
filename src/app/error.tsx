"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../ui/button";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset?: () => void;
}

const ErrorPage = ({ error }: ErrorPageProps) => {
  useEffect(() => {
    console.error("App error boundary", {
      message: error.message,
      name: error.name,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="h-screen flex flex-col gap-y-4 items-center justify-center">
      <AlertTriangle className="size-6" />
      <p className="text-sm text-muted-foreground">Ocorreu um erro.</p>
      <Button variant={"secondary"} asChild size={"sm"}>
        <Link href="/">Voltar ao Início</Link>
      </Button>
    </div>
  );
};

export default ErrorPage;
