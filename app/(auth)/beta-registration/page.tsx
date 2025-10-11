import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import BetaRegistrationForm from "@/components/auth/BetaRegistrationForm";

export default async function BetaRegistrationPage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <BetaRegistrationForm />;
}
