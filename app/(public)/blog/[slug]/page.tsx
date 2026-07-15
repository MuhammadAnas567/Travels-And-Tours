import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container, Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";

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
    <>
      <div className="bg-ink text-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <Badge variant="secondary" className="bg-paper/10 text-paper border-0 capitalize">
            {post.category}
          </Badge>
          <h1 className="mt-4 font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-paper max-w-[22ch]">
            {post.title}
          </h1>
          <p className="mt-4 max-w-xl text-paper/65 leading-relaxed">{post.excerpt}</p>
        </div>
      </div>

      <Section>
        <Container>
          <article className="mx-auto max-w-3xl">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {post.coverImage && (
              <div className="relative -mt-6 md:-mt-8 aspect-[16/9] overflow-hidden rounded-md border border-line shadow-sm">
                <Image
                  src={post.coverImage}
                  alt=""
                  fill
                  className="object-cover img-editorial"
                  priority
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR_DATA_URL}
                />
              </div>
            )}
            <div
              className="prose prose-neutral mt-10 max-w-none leading-relaxed text-ink-500 [&_h2]:font-display [&_h2]:text-ink [&_a]:text-pine-500"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br>") }}
            />
            <div className="mt-12 rounded-md border border-line bg-paper p-8 text-left shadow-sm">
              <p className="font-display text-xl font-semibold text-ink">Ready to book?</p>
              <Link
                href="/tours"
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-pine-500 hover:text-pine-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded-sm"
              >
                Explore matching tours →
              </Link>
            </div>
          </article>
        </Container>
      </Section>
    </>
  );
}
