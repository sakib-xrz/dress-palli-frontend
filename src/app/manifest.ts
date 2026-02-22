import type { MetadataRoute } from "next";
import { getServerPublicSettings } from "@/lib/server/settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getServerPublicSettings();

  const title = settings?.title || "Dress Palli";
  const description =
    settings?.description ||
    "Dress Palli is an online platform for buying and selling dresses for all occasions";

  return {
    name: title,
    short_name: title,
    description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#db2777",
    orientation: "portrait",
    icons: [
      {
        src: settings?.logo || "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: settings?.favicon || settings?.logo || "/logo.svg",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: settings?.favicon || settings?.logo || "/logo.svg",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["shopping", "lifestyle", "fashion"],
  };
}
