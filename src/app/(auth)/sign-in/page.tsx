import { getCurrent } from "@/src/features/auth/queries";
import { SignInCard } from "@/src/features/auth/components/sign-in-card";
import { redirect } from "next/navigation";

const SignInPage = async () => {
  const user = await getCurrent();

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
