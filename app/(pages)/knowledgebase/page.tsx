"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { WebsitesTab } from "@/components/knowledgebase/tabs/WebsitesTab";
import { FaqsTab } from "@/components/knowledgebase/tabs/FaqsTab";
import { BestandenTab } from "@/components/knowledgebase/tabs/FilesTab";
import { useTranslations } from "next-intl";

export default function KennisbankPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<string>("websites");

  const tabs = [
    {
      id: "websites",
      name: t("knowledgebase.tabs.websites"),
      component: WebsitesTab,
    },
    { id: "faqs", name: t("knowledgebase.tabs.faqs"), component: FaqsTab },
    {
      id: "bestanden",
      name: t("knowledgebase.tabs.bestanden"),
      component: BestandenTab,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("knowledgebase.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("knowledgebase.description")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm",
                activeTab === tab.id
                  ? "border-indigo-400 text-indigo-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
}
