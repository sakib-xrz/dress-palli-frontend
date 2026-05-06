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
        "relative mb-6 flex flex-col overflow-hidden md:mb-9",
        alignmentClasses[align],
        animated && "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
        className,
      )}
    >
      <div className="relative">
        <h2
          className={cn(
            "relative mb-3 inline-block text-2xl font-semibold tracking-tight md:mb-4 md:text-3xl lg:text-4xl",
            titleClassName,
          )}
        >
          <span className="bg-linear-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            {title}
          </span>

          {showDecorator && (
            <span
              className={cn(
                "absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-transparent via-primary/70 to-transparent",
                align === "center" && "left-1/5 right-1/5",
                align === "right" && "left-2/5",
              )}
            />
          )}
        </h2>
      </div>

      {description && (
        <p
          className={cn(
            "pt-1 text-sm leading-relaxed text-muted-foreground md:text-base",
            align === "center" && "mx-auto max-w-2xl",
            align === "right" && "max-w-2xl ml-auto",
            align === "left" && "max-w-2xl",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      )}

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
