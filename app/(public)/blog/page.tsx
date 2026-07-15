import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { CatalogHero, EmptyCatalog } from "@/components/layout/catalog-hero";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Travel Guides",
  description: "Visa guides, destination tips, and travel advice for Pakistanis and international visitors.",
};

export default async function BlogIndexPage() {
  let posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>> = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    });
  } catch (error) {
    console.error("[blog] DB unavailable:", error);
  }

  const [featured, ...rest] = posts;

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        eyebrow="Travel guides"
        title="Stories & practical advice"
        description="Visa tips, destination guides, and insider knowledge for smarter travel."
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 pb-20">
        {posts.length > 0 ? (
          <div className="space-y-10">
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid gap-6 overflow-hidden rounded-md border border-line bg-paper shadow-sm transition-[box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-brand)] hover:shadow-md hover:-translate-y-0.5 md:grid-cols-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
              >
                {featured.coverImage ? (
                  <div className="relative aspect-16/10 md:aspect-auto md:min-h-[280px] overflow-hidden">
                    <Image
                      src={featured.coverImage}
                      alt=""
                      fill
                      className="img-editorial object-cover transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)] group-hover:scale-[1.03]"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="min-h-[200px] bg-pine-100 md:min-h-[280px]" />
                )}
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <Badge variant="secondary">{featured.category}</Badge>
                  <h2 className="mt-3 font-display text-2xl md:text-3xl font-semibold text-ink group-hover:text-pine-500 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="mt-3 max-w-prose text-sm text-ink-500 leading-relaxed line-clamp-3">
                    {featured.excerpt}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-pine-500 link-underline self-start">
                    Read guide
                  </span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group overflow-hidden rounded-md border border-line bg-paper shadow-sm transition-[box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-brand)] hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
                  >
                    {post.coverImage && (
                      <div className="relative aspect-16/10 overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt=""
                          fill
                          className="img-editorial object-cover transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)] group-hover:scale-[1.03]"
                          sizes="(max-width:768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <Badge variant="secondary">{post.category}</Badge>
                      <h2 className="mt-2 font-display text-xl font-semibold text-ink group-hover:text-pine-500 transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm text-ink-500 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyCatalog
            title="Guides coming soon"
            description="Visa tips, destination guides, and travel advice will appear here."
          />
        )}
      </div>
    </div>
  );
}
