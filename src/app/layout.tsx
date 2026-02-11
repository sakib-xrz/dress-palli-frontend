import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dress Palli",
  description:
    "Dress Palli is an online platform for buying and selling dresses for all occasions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-muted-foreground text-sm">Loading...</div>
              </div>
            }
          >
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
