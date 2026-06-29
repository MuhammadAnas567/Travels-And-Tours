import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteTour } from "@/actions/admin";

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <AdminSidebar />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ocean-900">Tours</h1>
          <Button asChild>
            <Link href="/admin/tours/new">Add Tour</Link>
          </Button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-ocean-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ocean-100 bg-ocean-50 text-left text-gray-600">
                <th className="p-4">Title</th>
                <th className="p-4">Location</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Bookings</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id} className="border-b border-ocean-50">
                  <td className="p-4 font-medium">{tour.title}</td>
                  <td className="p-4">{tour.location}</td>
                  <td className="p-4">{formatPrice(Number(tour.price))}</td>
                  <td className="p-4">
                    <Badge variant={tour.status === "ACTIVE" ? "success" : "secondary"}>
                      {tour.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="p-4">{tour._count.bookings}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/tours/${tour.id}/edit`}>Edit</Link>
                      </Button>
                      <form
                        action={async () => {
                          "use server";
                          await deleteTour(tour.id);
                        }}
                      >
                        <Button variant="ghost" size="sm" type="submit" className="text-red-600">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
