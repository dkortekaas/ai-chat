"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function WebsiteContentPage() {
  const params = useParams();
  const router = useRouter();
  const [website, setWebsite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const websiteId = params.id as string;

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/websites/${websiteId}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setWebsite(data);
        } else {
          setError(
            `Failed to fetch website: ${response.status} ${response.statusText}`
          );
        }
      } catch (err) {
        setError(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (websiteId) {
      fetchWebsite();
    }
  }, [websiteId]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Loading...</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Website Not Found</h1>
        </div>
        <p className="text-gray-600">
          The website you're looking for could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">
          {website.name || "Website Content"}
        </h1>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium mb-2">Website Details</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p>
              <strong>URL:</strong> {website.url}
            </p>
            <p>
              <strong>Status:</strong> {website.status}
            </p>
            <p>
              <strong>Page Count:</strong> {website.pageCount}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(website.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {website.scrapedContent && (
          <div>
            <h2 className="text-lg font-medium mb-2">Scraped Content</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">
                {website.scrapedContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
