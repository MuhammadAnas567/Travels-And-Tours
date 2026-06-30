import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Travel Guides",
  description: "Visa guides, destination tips, and travel advice for Pakistanis and international visitors.",
};

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 12,
  });

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Travel Guides"
          title="Stories & practical advice"
          description="Visa tips, destination guides, and insider knowledge for smarter travel."
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-sm transition-shadow hover:shadow-lg"
            >
              {post.coverImage && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-5">
                <Badge variant="secondary">{post.category}</Badge>
                <h2 className="mt-2 font-display text-xl text-ink group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
        {posts.length === 0 && (
          <p className="text-center text-muted">Guides coming soon.</p>
        )}
      </Container>
    </Section>
  );
}
