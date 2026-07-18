"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { WishlistItem } from "@/lib/wishlist";

function asItems(raw: unknown): WishlistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (i): i is WishlistItem =>
      !!i &&
      typeof i === "object" &&
      typeof (i as WishlistItem).id === "string" &&
      typeof (i as WishlistItem).slug === "string"
  );
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
