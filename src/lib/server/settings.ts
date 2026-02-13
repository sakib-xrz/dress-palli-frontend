import "server-only";

import { BACKEND_API_URL } from "@/lib/auth";
import type { ApiResponse, PublicSetting } from "@/lib/type";

export async function getServerPublicSettings(): Promise<PublicSetting | null> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/settings/public`, {
      method: "GET",
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ApiResponse<PublicSetting>;
    return data.data ?? null;
  } catch {
    return null;
  }
}
