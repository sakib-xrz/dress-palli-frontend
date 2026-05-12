"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-background via-card/40 to-muted/50">
      <div className="flex flex-col items-center gap-10">
        {/* Brand Logo/Name */}
        <div className="flex flex-col items-center gap-3">
          {/* Logo with pulse effect */}
          <div className="relative mb-2">
            <Image
              src={"/logo.png"}
              alt={"Dress Point"}
              width={80}
              height={80}
              className="relative h-20 w-20 object-contain animate-bounce"
              priority
            />
          </div>

          <h1 className="bg-linear-to-r from-accent to-primary bg-clip-text font-serif text-3xl font-semibold tracking-wide text-transparent">
            {"Dress Point"}
          </h1>
          <p className="text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
            {"Elegance Delivered"}
          </p>
        </div>

        {/* Animated Loader */}
        <LoadingSpinner />
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            index % 2 === 0 ? "bg-primary" : "bg-accent",
          )}
          style={{
            animation: "pulse-scale 1.2s ease-in-out infinite",
            animationDelay: `${index * 150}ms`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse-scale {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.4);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
