import type { Metadata } from "next";
import { Suspense } from "react";
import { Lato, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { getServerPublicSettings } from "@/lib/server/settings";
import { GlobalLoading } from "@/components/shared/global-loading";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Dress Palli",
  description:
    "Dress Palli is an online platform for buying and selling dresses for all occasions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getServerPublicSettings();

  return (
    <html lang="en" className="light">
      <body
        className={`${lato.variable} ${playfairDisplay.variable} font-sans antialiased`}
      >
        <Providers initialSettings={settings}>
          <Suspense fallback={<GlobalLoading />}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
