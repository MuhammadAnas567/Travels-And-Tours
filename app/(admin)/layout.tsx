import { Navbar } from "@/components/shared/navbar";
import { AdminSidebar } from "@/components/shared/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-sand">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-3 py-8 sm:gap-8 sm:px-4 sm:py-14 lg:flex-row lg:gap-10 lg:px-6 lg:py-16 xl:px-8">
          <AdminSidebar />
          <div className="min-w-0 flex-1 overflow-x-auto rounded-md border border-line bg-paper p-4 shadow-sm sm:p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
