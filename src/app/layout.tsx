import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Mono, Lora, Montserrat } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/providers";
import { getServerPublicSettings } from "@/lib/server/settings";
import { GlobalLoading } from "@/components/shared/global-loading";
import {
  OrganizationSchema,
  WebSiteSchema,
} from "@/components/shared/json-ld-schema";
import { AnalyticsProvider } from "@/components/shared/analytics";

const fontSans = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fontSerif = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const SITE_URL_FALLBACK = "https://demo.dresspalli.com";
const OPEN_GRAPH_IMAGE_PATH = "/open-graph.jpg";

async function resolveSiteUrl(): Promise<string> {
  try {
    const requestHeaders = await headers();
    const forwardedHost =
      requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
    const forwardedProto = requestHeaders.get("x-forwarded-proto");

    if (forwardedHost) {
      const protocol =
        forwardedProto || (forwardedHost.includes("localhost") ? "http" : "https");
      return `${protocol}://${forwardedHost}`;
    }
  } catch {
    // Ignore and use fallback
  }

  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envSiteUrl) {
    return envSiteUrl;
  }

  return SITE_URL_FALLBACK;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getServerPublicSettings();
  const baseUrl = new URL(await resolveSiteUrl());
  const openGraphImageUrl = new URL(OPEN_GRAPH_IMAGE_PATH, baseUrl).toString();

  const title = settings?.title || "Dress Point";
  const description =
    settings?.description ||
    "Dress Point is an online platform for buying and selling dresses for all occasions. Explore elegant collections for every season.";
  const keywords =
    settings?.keywords ||
    "dress, point, fashion, online shopping, women clothing, saree, three piece, bangladeshi fashion";

  return {
    metadataBase: baseUrl,
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    alternates: {
      canonical: "/",
    },
    keywords: keywords.split(",").map((k) => k.trim()),
    authors: [{ name: title }],
    creator: title,
    publisher: title,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: baseUrl.toString(),
      siteName: title,
      title,
      description,
      images: [
        {
          url: openGraphImageUrl,
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
      images: [openGraphImageUrl],
      creator: "@dresspoint",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: settings?.favicon || settings?.logo || "/logo.svg",
      shortcut: settings?.favicon || settings?.logo || "/logo.svg",
      apple: settings?.logo || "/logo.svg",
    },
    verification: {
      google: settings?.google_analytics_id || undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getServerPublicSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers initialSettings={settings}>
          <AnalyticsProvider />
          <Suspense fallback={<GlobalLoading />}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
