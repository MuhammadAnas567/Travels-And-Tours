import { prisma } from "@/lib/db";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Rating } from "@/components/shared/rating";
import { ReviewActions } from "@/components/shared/review-actions";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      tour: { select: { title: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <AdminSidebar />
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-ocean-900">Review Moderation</h1>
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-ocean-100 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{review.tour.title}</p>
                  <p className="text-sm text-gray-500">by {review.user.name}</p>
                  <Rating value={review.rating} size="sm" />
                  <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                </div>
                <ReviewActions reviewId={review.id} approved={review.approved} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
