import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/products";
import { CATEGORY_SLUGS, SITE_URL } from "@/lib/site";
import { POLICY_SLUGS } from "@/lib/policies";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: products } = await getPublishedProducts();
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...Object.keys(CATEGORY_SLUGS).map((slug) => ({
      url: `${SITE_URL}/collections/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...POLICY_SLUGS.map((slug) => ({
      url: `${SITE_URL}/policies/${slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...(products ?? []).map((p) => ({
      url: `${SITE_URL}/product/${p.tag}`,
      lastModified: p.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
