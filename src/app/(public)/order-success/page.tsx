"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  IconCircleCheck,
  IconCopy,
  IconCheck,
  IconShoppingBag,
  IconPhone,
} from "@tabler/icons-react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!orderId) return;

    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      showToast.success("Order ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error("Failed to copy");
    }
  };

  if (!orderId) {
    return (
      <div className="min-h-[calc(100vh-10rem)] bg-linear-to-br from-pink-50/30 to-purple-50/30 dark:from-pink-950/5 dark:to-purple-950/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-pink-200/50 bg-white dark:bg-gray-900/50 dark:border-pink-800/50 p-12 backdrop-blur-sm shadow-sm">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                No order found
              </h2>
              <p className="text-muted-foreground max-w-md">
                It looks like you arrived here without placing an order.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="mt-4 bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              <Link href="/">
                <IconShoppingBag className="size-5" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-linear-to-br from-pink-50/30 to-purple-50/30 dark:from-pink-950/5 dark:to-purple-950/5">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="relative rounded-full bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-5">
              <IconCircleCheck className="size-16 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-8">
            Thank you for your order. <br /> We will contact you shortly for
            delivery updates.
          </p>

          {/* Order ID Card */}
          <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm mb-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Your Order ID
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold tracking-wide text-gray-900 dark:text-gray-100 font-mono">
                {orderId}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  "flex items-center justify-center size-9 rounded-lg border transition-all duration-200",
                  copied
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                )}
                aria-label="Copy order ID"
              >
                {copied ? (
                  <IconCheck className="size-4" />
                ) : (
                  <IconCopy className="size-4" />
                )}
              </button>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <IconPhone className="size-4" />
              <span>We&apos;ll call you before delivery</span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="w-full max-w-sm space-y-3 mb-8">
            <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-600 dark:border-green-900/30 p-4">
              <p className="text-sm text-green-800 dark:text-green-300">
                <span className="font-medium">
                  Save your order id <br /> You can use it to track your order
                  status.
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Button
              asChild
              size="lg"
              className="w-full bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/">
                <IconShoppingBag className="size-5" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
