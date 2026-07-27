/** Shared image helpers for next/image */

import type { ImageLoader } from "next/image";

/** Tiny navy-tinted blur used as blurDataURL for remote photos */
export const IMAGE_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAACAAIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z";

export const PLACEHOLDER_TOUR_IMAGE = "/images/placeholder-tour.jpg";

/**
 * Rewrites an Unsplash URL to request a sharper, properly cropped rendition.
 * Seeded data stores low-res (w=800) URLs; hero-size slots need more pixels.
 */
export function unsplashSrc(url: string, width = 1400, quality = 80) {
  if (!url || !url.includes("images.unsplash.com")) return url;
  const [base] = url.split("?");
  return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

/**
 * next/image loader that hits Unsplash CDN directly.
 * Avoids Next's hardcoded 7s upstream fetch timeout on /_next/image
 * (common failure mode when optimizing remote Unsplash assets in dev).
 */
export const unsplashLoader: ImageLoader = ({ src, width, quality }) => {
  const [base] = src.split("?");
  return `${base}?auto=format&fit=crop&w=${width}&q=${quality ?? 80}`;
};
