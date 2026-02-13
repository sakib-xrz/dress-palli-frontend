"use client";

import Image from "next/image";
import Link from "next/link";
import {
  IconMail,
  IconPhoneCall,
  IconBrandFacebook,
  IconBrandInstagram,
  IconHeart,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useGlobalSettings } from "@/contexts/settings-context";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/shop" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Featured", href: "/featured" },
];

const aboutLinks = [
  { label: "About Us", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "FAQs", href: "/faqs" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: IconBrandFacebook,
    color: "hover:bg-blue-100 dark:hover:bg-blue-900/20",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: IconBrandInstagram,
    color: "hover:bg-pink-100 dark:hover:bg-pink-900/20",
  },
];

export default function Footer() {
  const { settings } = useGlobalSettings();
  const brandName = settings?.title ?? "Dress Palli";
  const logo = settings?.logo ?? "";
  const email = settings?.email ?? "support@dresspalli.com";
  const phone = settings?.phone ?? "+880 1000-000000";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      {/* Main Footer Content */}
      <div className="bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-8">
          {/* Brand Section */}
          <div className="grid content-start gap-4">
            <div>
              <Link
                href="/"
                className="text-foreground grid w-fit auto-cols-max grid-flow-col items-center gap-3 group"
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
                  <div className="bg-linear-to-br from-pink-500 to-purple-600 text-white grid size-14 place-items-center rounded-xl text-lg font-bold shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {brandName.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="text-2xl font-bold tracking-tight mt-3 bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {brandName}
              </div>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              Your trusted destination for fashionable and quality outfits.
              Explore elegant collections for every season and occasion.
            </p>

            {/* Social Links */}
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
                      className={`transition-all duration-200 ${social.color}`}
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

          {/* Quick Links */}
          <div className="grid content-start gap-4">
            <h3 className="text-foreground text-sm font-bold tracking-wide uppercase">
              Quick Links
            </h3>
            <nav className="grid gap-2.5" aria-label="Quick links">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400 w-fit text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* About */}
          <div className="grid content-start gap-4">
            <h3 className="text-foreground text-sm font-bold tracking-wide uppercase">
              About
            </h3>
            <nav className="grid gap-2.5 mb-4" aria-label="About links">
              {aboutLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400 w-fit text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
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
                  className="hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors"
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
                  className="text-sm hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon-sm"
                  asChild
                  className="hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors"
                >
                  <a href={`mailto:${email}`} aria-label="Email us">
                    <IconMail className="size-4" />
                  </a>
                </Button>
                <a
                  href={`mailto:${email}`}
                  className="text-sm hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-muted-foreground text-xs flex items-center gap-1.5">
            <span>
              © {currentYear} {brandName}.
            </span>
            <span className="hidden sm:inline">All rights reserved.</span>
            <span className="inline sm:hidden">Made with</span>
            <IconHeart className="size-3 text-pink-500 fill-pink-500 inline sm:hidden" />
          </p>
          <div className="flex items-center gap-4 text-xs">
            <p className="text-muted-foreground hidden sm:block">
              Crafted with{" "}
              <IconHeart className="size-3 text-pink-500 fill-pink-500 inline" />{" "}
              by{" "}
              <Link
                href="https://sakib-info.vercel.app"
                className="text-pink-600 dark:text-pink-400 hover:underline font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                MD Sakibul Islam
              </Link>
            </p>
            <p className="text-muted-foreground sm:hidden">
              <Link
                href="https://sakib-info.vercel.app"
                className="text-pink-600 dark:text-pink-400 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                MD Sakibul Islam
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
