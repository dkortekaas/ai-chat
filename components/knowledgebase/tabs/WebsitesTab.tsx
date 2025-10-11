"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit,
  Bot,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WebsiteForm } from "@/components/knowledgebase/WebsiteForm";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { useToast } from "@/hooks/useToast";
import { useAssistant } from "@/contexts/assistant-context";

interface Website {
  id: string;
  url: string;
  name?: string;
  description?: string;
  pageCount: number;
  pages: number;
  syncSpeed?: number;
  syncInterval: string;
  lastSync?: string;
  status: "PENDING" | "SYNCING" | "COMPLETED" | "ERROR";
  errorMessage?: string;
  scrapedContent?: string;
  scrapedLinks?: string[];
  createdAt: string;
  updatedAt: string;
}

export function WebsitesTab() {
  const router = useRouter();
  const { currentAssistant } = useAssistant();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState<Website | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchWebsites = useCallback(async () => {
    if (!currentAssistant) return;

    try {
      const response = await fetch(
        `/api/websites?assistantId=${currentAssistant.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setWebsites(data);
      } else {
        throw new Error("Failed to fetch websites");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load websites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentAssistant, toast]);

  // Fetch websites on component mount and when assistant changes
  useEffect(() => {
    if (currentAssistant) {
      fetchWebsites();
    }
  }, [currentAssistant, fetchWebsites]);

  const handleAddWebsite = () => {
    setEditingWebsite(null);
    setIsFormOpen(true);
  };

  const handleEditWebsite = (website: Website) => {
    router.push(`/knowledgebase/websites/${website.id}`);
  };

  const handleDeleteWebsite = (website: Website) => {
    setWebsiteToDelete(website);
    setIsDeleteOpen(true);
  };

  const confirmDeleteWebsite = async () => {
    if (!websiteToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/websites/${websiteToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Website deleted",
          description: "The website has been deleted successfully.",
        });
        setIsDeleteOpen(false);
        setWebsiteToDelete(null);
        fetchWebsites();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete website");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete website",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchWebsites();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingWebsite(null);
  };

  const handleScrapeWebsite = async (website: Website) => {
    try {
      const response = await fetch(`/api/websites/${website.id}/scrape`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Scraping started",
          description: "The website scraping process has been initiated.",
        });
        // Refresh the websites list to show updated status
        setTimeout(() => {
          fetchWebsites();
        }, 1000);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to start scraping");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to start scraping",
        variant: "destructive",
      });
    }
  };

  const handleViewContent = (website: Website) => {
    router.push(`/knowledgebase/websites/${website.id}/content`);
  };

  const getStatusBadge = (status: Website["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>
        );
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "SYNCING":
        return <Badge className="bg-blue-100 text-blue-800">Syncing</Badge>;
      case "ERROR":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return "Never";

    const date = new Date(lastSync);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (!currentAssistant) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Assistant Selected
            </h3>
            <p className="text-sm text-gray-500">
              Please select an assistant from the dropdown above to manage
              websites.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Websites</h2>
          <p className="text-sm text-gray-500">
            Add and manage website URLs as knowledge sources for{" "}
            <strong>{currentAssistant.name}</strong>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            ↑ No changes
          </Button>
          <Button variant="outline" size="sm">
            ► Test
          </Button>
          <Button
            className="bg-indigo-500 hover:bg-indigo-600"
            onClick={handleAddWebsite}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Website
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sync Speed (pages/s)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sync Interval
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Sync
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading websites...
                  </td>
                </tr>
              ) : websites.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No websites added yet. Click &quot;Add Website&quot; to get
                    started.
                  </td>
                </tr>
              ) : (
                websites.map((website) => (
                  <tr key={website.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <button
                            onClick={() => handleEditWebsite(website)}
                            className="text-indigo-500 hover:text-blue-800 font-medium text-left"
                          >
                            {website.url}
                          </button>
                          {website.name && (
                            <div className="text-sm text-gray-500">
                              {website.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {website.pageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {website.syncSpeed ? website.syncSpeed.toFixed(2) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {website.syncInterval}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatLastSync(website.lastSync)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(website.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditWebsite(website)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleScrapeWebsite(website)}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Scrape Now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewContent(website)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Content
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteWebsite(website)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Website Form Dialog */}
      <WebsiteForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        website={editingWebsite}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteOpen(false);
            setWebsiteToDelete(null);
          }
        }}
        onConfirm={confirmDeleteWebsite}
        title="Delete website?"
        description="This will remove the website URL and its associated scraped data from this assistant. This action cannot be undone."
        itemName={websiteToDelete?.url || ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
