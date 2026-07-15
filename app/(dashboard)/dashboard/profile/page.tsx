"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      await update({ name: formData.get("name") as string });
      toast.success("Profile updated");
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Profile Settings
      </h1>
      <Card className="mt-6 max-w-lg border-line bg-sand/40">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={session?.user?.name ?? ""}
                required
                className="mt-1 rounded-sm border-line focus-visible:ring-brass-500"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={session?.user?.email ?? ""}
                required
                className="mt-1 rounded-sm border-line focus-visible:ring-brass-500"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
