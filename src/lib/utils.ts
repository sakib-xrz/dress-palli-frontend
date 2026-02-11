import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeParams(
  params: Record<string, string | number | boolean | undefined>,
) {
  const sanitizedObj: Record<string, string | number | boolean | undefined> =
    {};

  for (const key in params) {
    if (params[key]) {
      sanitizedObj[key as keyof typeof params] =
        params[key as keyof typeof params];
    }
  }

  return sanitizedObj;
}
