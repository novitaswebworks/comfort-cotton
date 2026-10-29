export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://comfort-cotton.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "Comfort Cottons";

export const CATEGORY_SLUGS: Record<string, string> = {
  "double-bed-king-size": "Double bed king size",
  "double-bed-queen-size": "Double bed queen size",
  "single-bed-without-pillow-cover": "Single Bed without pillow cover",
  "single-bed-with-pillow-cover": "Single Bed with Pillow cover",
  "deewan-sets": "Deewan Sets",
  "dohads-quilt": "Dohads (Quilt)",
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Double bed king size": "Experience unparalleled comfort and grand proportions with our premium king size bedsheets. Designed for spacious luxury.",
  "Double bed queen size": "Perfectly tailored for your queen bed. Woven from the finest cotton for a soft, breathable, and restful sleep.",
  "Single Bed without pillow cover": "Minimalist single bedsheets that bring a crisp, clean aesthetic to any room. Pure comfort, simplified.",
  "Single Bed with Pillow cover": "Complete your single bed setup with these beautifully matched sets, featuring a coordinating pillow cover for a cohesive look.",
  "Deewan Sets": "Transform your living space with our elegant Deewan sets. Traditional craftsmanship meets modern comfort for daytime lounging.",
  "Dohads (Quilt)": "Lightweight, breathable, and incredibly soft. Our Dohads provide the perfect layer of warmth for year-round comfort.",
};

export function categorySlug(name: string): string | undefined {
  return Object.entries(CATEGORY_SLUGS).find(([, n]) => n === name)?.[0];
}
