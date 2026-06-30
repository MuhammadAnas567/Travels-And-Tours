import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container, Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, published: true },
  });
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt?.toISOString(),
  };

  return (
    <Section>
      <Container>
        <article className="mx-auto max-w-3xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <Badge variant="secondary">{post.category}</Badge>
          <h1 className="mt-4 font-display text-hero font-medium text-ink">{post.title}</h1>
          <p className="mt-4 text-muted">{post.excerpt}</p>
          {post.coverImage && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)]">
              <Image src={post.coverImage} alt="" fill className="object-cover" priority />
            </div>
          )}
          <div
            className="prose prose-neutral mt-10 max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br>") }}
          />
          <div className="mt-12 rounded-[var(--radius-lg)] border border-line bg-sand p-6 text-center">
            <p className="font-display text-lg text-ink">Ready to book?</p>
            <Link href="/tours" className="mt-2 inline-block text-primary hover:underline">
              Explore matching tours →
            </Link>
          </div>
        </article>
      </Container>
    </Section>
  );
}
