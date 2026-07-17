import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createCoupon, deleteCoupon, toggleCouponActive } from "@/actions/admin-coupons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow text-pine-600">Admin</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">Coupons</h1>
        <p className="mt-2 text-ink-500">Create codes that apply at tour checkout.</p>
      </div>

      <form
        action={async (formData) => {
          "use server";
          await createCoupon(formData);
          revalidatePath("/admin/coupons");
        }}
        className="max-w-xl space-y-4 rounded-md border border-line bg-paper p-6 shadow-sm"
      >
        <h2 className="font-display text-lg font-semibold">New coupon</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" required placeholder="SUMMER10" className="mt-1 uppercase" />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              className="mt-1 flex h-11 w-full rounded-md border border-line bg-paper px-3 text-sm"
              defaultValue="PERCENT"
            >
              <option value="PERCENT">Percent</option>
              <option value="FIXED">Fixed USD</option>
            </select>
          </div>
          <div>
            <Label htmlFor="value">Value</Label>
            <Input id="value" name="value" type="number" step="0.01" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="minSpend">Min spend (USD, optional)</Label>
            <Input id="minSpend" name="minSpend" type="number" step="0.01" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="usageLimit">Usage limit (optional)</Label>
            <Input id="usageLimit" name="usageLimit" type="number" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="validFrom">Valid from</Label>
            <Input id="validFrom" name="validFrom" type="date" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="validTo">Valid to</Label>
            <Input id="validTo" name="validTo" type="date" required className="mt-1" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" name="isActive" defaultChecked /> Active
        </label>
        <Button type="submit">Create coupon</Button>
      </form>

      <div className="space-y-3">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-paper p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{c.code}</span>
                <Badge variant={c.isActive ? "accent" : "secondary"}>
                  {c.isActive ? "Active" : "Off"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {c.type === "PERCENT" ? `${c.value}%` : `$${c.value}`} · used {c.usageCount}
                {c.usageLimit != null ? `/${c.usageLimit}` : ""} · until{" "}
                {c.validTo.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <form
                action={async () => {
                  "use server";
                  await toggleCouponActive(c.id, !c.isActive);
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  {c.isActive ? "Disable" : "Enable"}
                </Button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await deleteCoupon(c.id);
                }}
              >
                <Button type="submit" variant="ghost" size="sm" className="text-error">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
        {coupons.length === 0 ? (
          <p className="text-ink-500">No coupons yet. Create one above or run seed.</p>
        ) : null}
      </div>
    </div>
  );
}
