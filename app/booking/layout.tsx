import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 bg-sand">
        {children}
      </main>
      <Footer />
    </>
  );
}
