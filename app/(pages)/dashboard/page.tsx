// app/(pages)/dashboard/page.tsx
import { getAuthSession } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

async function getDashboardData() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }
}

export default async function Dashboard() {
  const session = await getAuthSession();
  const t = await getTranslations("dashboard");
  const dashboardData = await getDashboardData();

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("welcome", { name: session?.user?.name || "Gebruiker" })}
          </p>
        </div>
      </div>
    </div>
  );
}
