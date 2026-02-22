import { ImageResponse } from "next/og";
import { getServerPublicSettings } from "@/lib/server/settings";

// Route segment config
export const runtime = "edge";
export const alt = "Dress Palli";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation (same as opengraph-image)
export default async function TwitterImage() {
  const settings = await getServerPublicSettings();

  return new ImageResponse(
    <div
      style={{
        fontSize: 128,
        background:
          "linear-gradient(135deg, #fff 0%, #fce7f3 30%, #f3e8ff 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px",
      }}
    >
      {/* Logo */}
      {settings?.logo && (
        <div
          style={{
            display: "flex",
            marginBottom: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.logo}
            alt={settings.title || "Dress Palli"}
            width={200}
            height={200}
            style={{
              borderRadius: "50%",
              boxShadow: "0 20px 60px rgba(219, 39, 119, 0.3)",
            }}
          />
        </div>
      )}

      {/* Brand Name */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          background: "linear-gradient(90deg, #db2777 0%, #9333ea 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          letterSpacing: "-0.02em",
          marginBottom: 16,
        }}
      >
        {settings?.title || "Dress Palli"}
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          color: "#db2777",
          opacity: 0.8,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        Elegance Delivered
      </div>
    </div>,
    {
      ...size,
    },
  );
}
