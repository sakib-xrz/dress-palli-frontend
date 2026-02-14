import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  showDecorator?: boolean;
  animated?: boolean;
  children?: ReactNode;
}

export default function SectionHeader({
  title,
  description,
  align = "center",
  className,
  titleClassName,
  descriptionClassName,
  showDecorator = true,
  animated = true,
  children,
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn(
        "mb-10 md:mb-12 flex flex-col relative overflow-hidden",
        alignmentClasses[align],
        animated && "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
        className,
      )}
    >
      <div className="relative">
        {/* Title with Gradient */}
        <h2
          className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 relative inline-block",
            titleClassName,
          )}
        >
          <span className="bg-linear-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent bg-size-[200%_auto] animate-gradient">
            {title}
          </span>

          {/* Decorative underline */}
          {showDecorator && (
            <span
              className={cn(
                "absolute -bottom-[35%] left-0 right-0 h-1 bg-linear-to-r from-transparent via-pink-500 to-transparent rounded-full opacity-60",
                align === "center" && "left-1/4 right-1/4",
                align === "right" && "left-1/2",
              )}
            />
          )}
        </h2>
      </div>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "text-muted-foreground text-sm md:text-base lg:text-lg leading-relaxed pt-4",
            align === "center" && "max-w-2xl mx-auto",
            align === "right" && "max-w-2xl ml-auto",
            align === "left" && "max-w-2xl",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      )}

      {/* Optional children for custom content */}
      {children && <div className="mt-4">{children}</div>}

      {/* Decorative floating elements */}
      {showDecorator && (
        <>
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-pink-200 dark:bg-pink-900/20 rounded-full blur-3xl opacity-40 pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-40 pointer-events-none" />
        </>
      )}
    </div>
  );
}
