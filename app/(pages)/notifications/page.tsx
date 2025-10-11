import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layouts";
import { NotificationList } from "@/components/notification/NotificationList";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await getAuthSession();
  const t = await getTranslations("notifications");

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch notifications for the current user
  const notifications = await db.notification.findMany({
    where: {
      targetUsers: {
        has: session.user.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="flex justify-center">
        <div className="w-full max-w-2xl p-6">
          <NotificationList initialNotifications={notifications} />
        </div>
      </div>
    </div>
  );
}
