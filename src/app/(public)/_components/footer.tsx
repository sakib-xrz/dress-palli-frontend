"use client";

import Image from "next/image";
import Link from "next/link";
import { IconMail, IconPhoneCall } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useGlobalSettings } from "@/contexts/settings-context";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Cart", href: "/cart" },
];

export default function Footer() {
  const { settings } = useGlobalSettings();
  const brandName = settings?.title ?? "Dress Palli";
  const logo = settings?.logo ?? "";
  const email = settings?.email ?? "support@dresspalli.com";
  const phone = settings?.phone ?? "+880 1000-000000";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-muted/30 border-t">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr] md:gap-8">
        <div className="grid content-start gap-5">
          <div>
            <Link
              href="/"
              className="text-foreground grid w-fit auto-cols-max grid-flow-col items-center gap-3"
            >
              {logo ? (
                <Image
                  src={logo}
                  alt={brandName}
                  width={80}
                  height={80}
                  className="aspect-square size-12 rounded-md object-contain"
                />
              ) : (
                <div className="bg-primary text-primary-foreground grid size-11 place-items-center rounded-md text-sm font-semibold">
                  {brandName.charAt(0)}
                </div>
              )}
            </Link>
            <div className="text-xl font-semibold tracking-tight mt-2">
              {brandName}
            </div>
          </div>
          <p className="text-muted-foreground max-w-sm text-sm leading-6">
            Your trusted destination for fashionable and quality outfits.
            Explore elegant collections for every season and occasion.
          </p>
        </div>

        <div className="grid content-start gap-4">
          <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
            Quick Links
          </h3>
          <nav className="grid gap-2" aria-label="Quick links">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground w-fit text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="grid content-start gap-4">
          <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
            Contact
          </h3>
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" asChild>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  aria-label="Call us"
                >
                  <IconPhoneCall />
                </a>
              </Button>
              <span className="font-normal">{phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" asChild>
                <a href={`mailto:${email}`} aria-label="Email us">
                  <IconMail />
                </a>
              </Button>
              <span className="font-normal">{email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-border border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center sm:flex-row sm:text-left">
          <p className="text-muted-foreground text-xs">
            {currentYear} {brandName}. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Designed and developed by{" "}
            <Link
              href="https://sakib-info.vercel.app"
              className="text-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              MD Sakibul Islam
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
