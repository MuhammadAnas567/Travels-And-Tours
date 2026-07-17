import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
      <Header />
      <main id="main-content" className="flex-1 bg-sand">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:flex-row lg:gap-12 lg:px-8 lg:py-16">
          <DashboardSidebar />
          <div className="min-w-0 flex-1">
            <div className="rounded-md border border-line bg-paper p-5 shadow-sm sm:p-8 md:p-10">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
