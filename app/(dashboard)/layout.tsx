import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 lg:flex-row sm:px-6 lg:px-8">
          <DashboardSidebar />
          <div className="flex-1">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
