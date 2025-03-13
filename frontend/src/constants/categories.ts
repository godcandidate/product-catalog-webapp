export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Books",
  "Sports",
  "Other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
