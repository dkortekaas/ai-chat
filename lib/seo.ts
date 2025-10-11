// lib/seo.ts

import { Metadata } from "next";

export function generateMetadata(
  title: string,
  description: string,
  path: string = "/"
): Metadata {
  const url = `https://www.declair.app${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Declair",
      locale: "nl_NL",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}
