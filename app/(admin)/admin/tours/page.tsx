import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteTour } from "@/actions/admin";

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
          Tours
        </h1>
        <Button asChild>
          <Link href="/admin/tours/new">Add Tour</Link>
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border border-line bg-paper">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-sand text-left text-ink-500">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Bookings</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => (
              <tr key={tour.id} className="border-b border-line">
                <td className="p-4 font-medium text-ink-900">{tour.title}</td>
                <td className="p-4 text-ink-700">{tour.location}</td>
                <td className="p-4 tabular-nums text-ink-900">
                  {formatPrice(Number(tour.price))}
                </td>
                <td className="p-4">
                  <Badge variant={tour.status === "ACTIVE" ? "success" : "secondary"}>
                    {tour.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="p-4 tabular-nums text-ink-700">
                  {tour._count.bookings}
                </td>
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
                      <Button variant="ghost" size="sm" type="submit" className="text-error">
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
  );
}
