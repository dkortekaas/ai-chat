"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import { ArrowLeft, Settings, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Website, Webpage, SyncLog } from "@/types/knowledgebase";
import { useTranslations } from "next-intl";

export default function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [website, setWebsite] = useState<Website | null>(null);
  const [webpages, setWebpages] = useState<Webpage[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations();

  const tabs = [
    { id: "overview", name: t("knowledgebase.overview") },
    { id: "webpages", name: t("knowledgebase.webpages") },
    { id: "sync-logs", name: t("knowledgebase.sync-logs") },
  ];

  const fetchWebsiteDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/websites/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setWebsite(data);
      }
    } catch (error) {
      console.error("Error fetching website details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchWebsiteDetails();
    }
  }, [params.id, fetchWebsiteDetails]);

  const getStatusBadge = (status: Website["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800">
            ✓ {t("knowledgebase.statusDetails.completed")}
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            {t("knowledgebase.statusDetails.pending")}
          </Badge>
        );
      case "SYNCING":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {t("knowledgebase.statusDetails.syncing")}
          </Badge>
        );
      case "ERROR":
        return (
          <Badge className="bg-red-100 text-red-800">
            {t("knowledgebase.statusDetails.error")}
          </Badge>
        );
    }
  };

  const getLogTypeBadge = (type: string) => {
    switch (type) {
      case "url_outside_allowed_domains":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            url_outside_allowed_domains
          </Badge>
        );
      case "url_already_seen":
        return (
          <Badge className="bg-blue-100 text-blue-800">url_already_seen</Badge>
        );
      case "url_invalid":
        return <Badge className="bg-red-100 text-red-800">url_invalid</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("knowledgebase.websiteNotFound")}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {website.url}
            </h1>
            {website.name && (
              <p className="text-sm text-gray-500">{website.name}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            ↑ {t("common.noChanges")}
          </Button>
          <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600">
            ► {t("common.test")}
          </Button>
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
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Website Configuration */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {t("knowledgebase.websiteConfiguration")}
                </h3>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  {t("knowledgebase.configure")}
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.url")}:
                  </span>
                  <span className="text-sm font-medium">{website.url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.title")}:
                  </span>
                  <span className="text-sm font-medium">
                    {website.name || "Not Set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.maxDepth")}:
                  </span>
                  <span className="text-sm font-medium">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.maxUrls")}:
                  </span>
                  <span className="text-sm font-medium">500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.syncSchedule")}:
                  </span>
                  <span className="text-sm font-medium">
                    {website.syncInterval}
                  </span>
                </div>
              </div>
            </Card>

            {/* Sync Status */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {t("knowledgebase.syncStatus")}
                </h3>
                <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                  <Play className="w-4 h-4 mr-2" />
                  {t("knowledgebase.runNow")}
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.status")}:
                  </span>
                  {getStatusBadge(website.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.pendingUrls")}:
                  </span>
                  <span className="text-sm font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.visitedUrls")}:
                  </span>
                  <span className="text-sm font-medium">{website.pages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.startedAt")}:
                  </span>
                  <span className="text-sm font-medium">
                    Feb 11, 2025, 2:16:43 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.duration")}:
                  </span>
                  <span className="text-sm font-medium">6 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("knowledgebase.error")}:
                  </span>
                  <span className="text-sm font-medium text-gray-400">-</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "webpages" && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("knowledgebase.path")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("knowledgebase.status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("knowledgebase.size")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("knowledgebase.downloadedAt")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {webpages.map((webpage) => (
                    <tr key={webpage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {webpage.path === "/" ? "{ empty }" : webpage.path}
                          </div>
                          <div className="text-sm text-gray-500">
                            {webpage.fullUrl.replace("https://", "")}
                          </div>
                          <div className="text-sm text-gray-500">
                            {webpage.contentType}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-green-100 text-green-800">
                          {webpage.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {webpage.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {webpage.downloadedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "sync-logs" && (
          <Card>
            <div className="p-6">
              <div className="space-y-4">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getLogTypeBadge(log.type)}
                        <span className="text-sm text-gray-500">
                          {log.timestamp}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 mb-2">
                        {log.message}
                      </div>
                      {log.url && (
                        <div className="text-sm text-indigo-500 hover:text-blue-800">
                          <a
                            href={log.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {log.url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
