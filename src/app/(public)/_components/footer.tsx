"use client";

import Image from "next/image";
import Link from "next/link";
import {
  IconMail,
  IconPhoneCall,
  IconBrandFacebook,
  IconBrandInstagram,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useGlobalSettings } from "@/contexts/settings-context";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Track Order", href: "/track-order" },
];

export default function Footer() {
  const { settings } = useGlobalSettings();
  const brandName = settings?.title ?? "Dress Point";
  const logo = settings?.logo ?? "";
  const email = settings?.email ?? "support@dresspoint.com";
  const phone = settings?.phone ?? "+880 1000-000000";
  const currentYear = new Date().getFullYear();
  const facebookUrl = settings?.facebook ?? null;
  const instagramUrl = settings?.instagram ?? null;

  const socialLinks = [
    {
      label: "Facebook",
      href: facebookUrl || "https://facebook.com",
      icon: IconBrandFacebook,
      color: "hover:bg-muted hover:text-accent",
    },
    {
      label: "Instagram",
      href: instagramUrl || "https://instagram.com",
      icon: IconBrandInstagram,
      color: "hover:bg-muted hover:text-accent",
    },
  ];

  return (
    <footer className="border-t border-border/80">
      <div className="bg-linear-to-b from-transparent via-card/45 to-card/80">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-8">
          <div className="grid content-start gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="group grid w-fit auto-cols-max grid-flow-col items-center gap-3 text-foreground"
              >
                {logo ? (
                  <Image
                    src={logo}
                    alt={brandName}
                    width={80}
                    height={80}
                    className="aspect-square size-14 rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid size-14 place-items-center rounded-xl bg-linear-to-br from-primary to-accent text-lg font-bold text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {brandName.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="bg-linear-to-r from-accent to-primary bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                {brandName}
              </div>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              Curated fashion for everyday elegance. Discover modern silhouettes,
              festive styles, and signature looks delivered with care.
            </p>
          </div>

          <div className="grid content-start gap-4">
            <h3 className="text-foreground text-sm font-bold tracking-wide uppercase">
              Quick Links
            </h3>
            <nav className="grid gap-2.5" aria-label="Quick links">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="inline-block w-fit text-sm text-muted-foreground transition-all duration-200 hover:translate-x-1 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-foreground text-sm font-bold mb-3">
              Contact Us
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon-sm"
                  asChild
                  className="transition-colors hover:bg-muted"
                >
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    aria-label="Call us"
                  >
                    <IconPhoneCall className="size-4" />
                  </a>
                </Button>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-sm transition-colors hover:text-primary"
                >
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon-sm"
                  asChild
                  className="transition-colors hover:bg-muted"
                >
                  <a href={`mailto:${email}`} aria-label="Email us">
                    <IconMail className="size-4" />
                  </a>
                </Button>
                <a
                  href={`mailto:${email}`}
                  className="text-sm transition-colors hover:text-primary"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Follow Us</p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.label}
                    variant="outline"
                    size="icon"
                    asChild
                    className={`rounded-xl transition-all duration-200 ${social.color}`}
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <Icon className="size-5" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/80 bg-card/85">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {currentYear} {brandName}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Secure payments • Quality guaranteed • Customer-first support
          </p>
        </div>
      </div>
    </footer>
  );
}
