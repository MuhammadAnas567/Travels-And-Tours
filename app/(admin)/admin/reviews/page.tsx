import { prisma } from "@/lib/db";
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
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Review Moderation
      </h1>
      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-md border border-line bg-paper p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-ink-900">{review.tour.title}</p>
                <p className="text-sm text-ink-500">by {review.user.name}</p>
                <Rating value={review.rating} size="sm" />
                <p className="mt-2 text-sm text-ink-700">{review.comment}</p>
              </div>
              <ReviewActions reviewId={review.id} approved={review.approved} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
