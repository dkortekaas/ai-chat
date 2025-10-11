"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Import tab components
import { PersonalDetailsTab } from "@/components/account/PersonalDetailsTab";
import { EmailSettingsTab } from "@/components/account/EmailSettingsTab";
import { ChangePasswordTab } from "@/components/account/ChangePasswordTab";
import { SubscriptionTab } from "@/components/account/SubscriptionTab";
import { TeamTab } from "@/components/account/TeamTab";
import { useTranslations } from "next-intl";

function AccountPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("personal-details");
  const t = useTranslations("account");

  const tabs = useMemo(
    () => [
      {
        id: "personal-details",
        name: t("tabs.personalDetails"),
        component: PersonalDetailsTab,
      },
      {
        id: "email-settings",
        name: t("tabs.emailSettings"),
        component: EmailSettingsTab,
      },
      {
        id: "change-password",
        name: t("tabs.changePassword"),
        component: ChangePasswordTab,
      },
      {
        id: "subscription",
        name: t("tabs.subscription"),
        component: SubscriptionTab,
      },
      { id: "team", name: t("tabs.team"), component: TeamTab },
    ],
    [t]
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.find((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, tabs]);

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t("myAccount")}
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm rounded-none",
                activeTab === tab.id
                  ? "border-indigo-400 text-indigo-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.name}
            </Button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountPageContent />
    </Suspense>
  );
}
