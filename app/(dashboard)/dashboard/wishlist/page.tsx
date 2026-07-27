import { redirect } from "next/navigation";

/** Wishlist section removed — old bookmarks land on dashboard. */
export default function WishlistPage() {
  redirect("/dashboard");
}
