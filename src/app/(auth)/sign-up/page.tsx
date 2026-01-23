import { getCurrent } from "@/src/features/auth/queries";
import { SignUpCard } from "@/src/features/auth/components/sign-up-card";
import { redirect } from "next/navigation";

const SignUpPage = async () => {
  let user = null;

  try {
    user = await getCurrent();
  } catch (error) {
    // Em Next.js 16, cookies() pode falhar com "_formData.get is not a function"
    // em certos contextos (especialmente após OAuth redirects).
    // Isso é seguro ignorar aqui pois significa que não há sessão válida.
    console.error("[SignUpPage] Erro ao verificar sessão:", error);
  }

  if (user) {
    redirect("/");
  }

  return <SignUpCard />;
};

export default SignUpPage;
