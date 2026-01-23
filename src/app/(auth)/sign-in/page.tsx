import { getCurrent } from "@/src/features/auth/queries";
import { SignInCard } from "@/src/features/auth/components/sign-in-card";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SignInPage = async () => {
  let user = null;

  try {
    user = await getCurrent();
  } catch (error) {
    // Em Next.js 16, cookies() pode falhar com "_formData.get is not a function"
    // em certos contextos (especialmente após OAuth redirects).
    // Isso é seguro ignorar aqui pois significa que não há sessão válida.
    console.error("[SignInPage] Erro ao verificar sessão:", error);
  }

  if (user) {
    redirect("/");
  }

  return (
    <div>
      <SignInCard />
    </div>
  );
};

export default SignInPage;
