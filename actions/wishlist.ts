"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { WishlistItem } from "@/lib/wishlist";

function asItems(raw: unknown): WishlistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((i) => {
      if (!i || typeof i !== "object") return null;
      const item = i as Partial<WishlistItem>;
      if (typeof item.id !== "string" || typeof item.slug !== "string") return null;
      return {
        id: item.id,
        slug: item.slug,
        name: typeof item.name === "string" && item.name ? item.name : "Saved stay",
        city: typeof item.city === "string" ? item.city : "",
        country: typeof item.country === "string" ? item.country : "",
        image: typeof item.image === "string" ? item.image : "",
        pricePerNight:
          typeof item.pricePerNight === "number" && Number.isFinite(item.pricePerNight)
            ? item.pricePerNight
            : 0,
        savedAt:
          typeof item.savedAt === "string" && item.savedAt
            ? item.savedAt
            : new Date(0).toISOString(),
      } satisfies WishlistItem;
    })
    .filter((i): i is WishlistItem => i !== null);
}

export async function getServerWishlist(): Promise<WishlistItem[]> {
  const session = await getSession();
  if (!session?.user?.id) return [];
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { wishlist: true },
  });
  return asItems(user?.wishlist);
}

export async function syncWishlistToServer(localItems: WishlistItem[]) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Sign in required" };

  const existing = await getServerWishlist();
  const map = new Map<string, WishlistItem>();
  for (const item of existing) map.set(item.id, item);
  for (const item of localItems) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  await prisma.user.update({
    where: { id: session.user.id },
    data: { wishlist: merged },
  });

  revalidatePath("/dashboard/wishlist");
  return { items: merged };
}

export async function saveWishlistToServer(items: WishlistItem[]) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Sign in required" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { wishlist: items },
  });

  revalidatePath("/dashboard/wishlist");
  return { ok: true };
}
