"use client";

import { useParams } from "next/navigation";

export default function TestPage() {
  const params = useParams();
  const websiteId = params.id as string;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>Website ID: {websiteId}</p>
      <p>This is a test page to verify routing works.</p>
    </div>
  );
}
