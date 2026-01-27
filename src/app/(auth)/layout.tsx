"use client";
import { Button } from "@/src/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
}
const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname();
  return (
    <main className="bg-neutral-100 min-h-screen w-full">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center">
          <Image src="/logo.svg" alt="logo" height={56} width={152} />
          <Button asChild variant={"secondary"}>
            <Link href={pathname === "/sign-in" ? "/sign-up" : "/sign-in"}>
              {pathname === "/sign-in" ? "Sign Up" : "Login"}
            </Link>
          </Button>
        </nav>

        <div className="flex flex-col md:items-center md:justify-center pt-8 md:pt-14 w-full">
          {children}
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
