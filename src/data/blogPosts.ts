/** Метаданные статей блога (контент текстов — в i18n `blog.<id>.*`). */

export const BLOG_TAG_KEYS = ["fit", "documents", "deadlines", "scholarships", "strategy"] as const;
export type BlogTagKey = (typeof BLOG_TAG_KEYS)[number];

export const BLOG_POST_ORDER = ["a1", "a2", "a3", "a4", "a5"] as const;
export type BlogPostId = (typeof BLOG_POST_ORDER)[number];

export type BlogPostMeta = {
  tags: readonly BlogTagKey[];
  /** Примерное время чтения (мин.), для UI */
  readMin: number;
};

export const BLOG_POST_META: Record<BlogPostId, BlogPostMeta> = {
  a1: { tags: ["fit", "strategy"], readMin: 4 },
  a2: { tags: ["documents", "deadlines"], readMin: 5 },
  a3: { tags: ["scholarships", "strategy"], readMin: 6 },
  a4: { tags: ["deadlines", "strategy"], readMin: 5 },
  a5: { tags: ["fit", "strategy"], readMin: 5 },
};
