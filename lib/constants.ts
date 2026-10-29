import { CATEGORY_SLUGS } from "@/lib/site";

export const CATEGORIES = Object.values(CATEGORY_SLUGS) as [string, ...string[]];
export const PRODUCT_STATUSES = ["Published", "Draft"] as const;
