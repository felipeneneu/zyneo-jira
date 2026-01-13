import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/src/ui/sonner";

import { QueryProvider } from "./components/query-provider";
import { Providers } from "@/src/lib/providers";
import "@/src/app/globals.css";

const InterFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Zyneolist | Gestão de Projetos Inteligente com IA para Times de Alta Performance",
  description:
    "Otimize a gestão de projetos e tarefas com o Zyneolist. Use o poder da IA para refinar escopos, automatizar fluxos e colaborar em tempo real. A plataforma definitiva para equipes que buscam eficiência e resultados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${InterFont.variable} antialiased min-h-screen`}>
        <QueryProvider>
          <Providers>
            <Toaster />
            {children}
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
