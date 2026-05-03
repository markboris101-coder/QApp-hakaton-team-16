import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { bumpBlogVisit } from "../lib/demoAnalytics";
import {
  BLOG_POST_META,
  BLOG_POST_ORDER,
  BLOG_TAG_KEYS,
  type BlogPostId,
  type BlogTagKey,
} from "../data/blogPosts";

export function BlogPage() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<BlogTagKey | "all">("all");

  useEffect(() => {
    bumpBlogVisit();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const visibleIds = useMemo(() => {
    return BLOG_POST_ORDER.filter((id) => {
      const meta = BLOG_POST_META[id];
      if (tagFilter !== "all" && !meta.tags.includes(tagFilter)) return false;
      if (!normalizedQuery) return true;
      const hay = [
        t(`blog.${id}.title`),
        t(`blog.${id}.lead`),
        t(`blog.${id}.body`),
        t(`blog.${id}.extra`, { defaultValue: "" }),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(normalizedQuery);
    });
  }, [normalizedQuery, tagFilter, t, i18n.language]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 text-slate-900"
    >
      <div className="mx-auto w-full max-w-[min(100%,1200px)] px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            {t("blog.toDashboard")}
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-indigo-700 underline-offset-4 hover:text-indigo-900 hover:underline"
          >
            {t("blog.backHome")}
          </Link>
        </div>

        <header className="mt-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{t("blog.kicker")}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
            {t("blog.title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">{t("blog.subtitle")}</p>
        </header>

        <div className="mt-10 flex flex-col gap-6 lg:mt-12 lg:flex-row lg:items-start lg:gap-10">
          <aside className="lg:w-56 lg:shrink-0">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm ring-1 ring-slate-100 backdrop-blur-sm">
              <div>
                <label htmlFor="blog-search" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("blog.searchLabel")}
                </label>
                <input
                  id="blog-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("blog.searchPlaceholder")}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500/0 transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                  autoComplete="off"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("blog.tagsLabel")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTagFilter("all")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      tagFilter === "all"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {t("blog.filterAll")}
                  </button>
                  {BLOG_TAG_KEYS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTagFilter(tag)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        tagFilter === tag ? "bg-violet-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {t(`blog.tags.${tag}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("blog.tocTitle")}</p>
                <nav className="mt-3 max-h-[min(40vh,320px)] space-y-1 overflow-y-auto text-sm" aria-label={t("blog.tocTitle")}>
                  {visibleIds.map((id) => (
                    <a
                      key={id}
                      href={`#post-${id}`}
                      className="block truncate rounded-lg px-2 py-1.5 text-slate-700 hover:bg-indigo-50 hover:text-indigo-900"
                    >
                      {t(`blog.${id}.title`)}
                    </a>
                  ))}
                </nav>
              </div>
              <p className="text-xs text-slate-500">
                {t("blog.postsVisible", { count: visibleIds.length, total: BLOG_POST_ORDER.length })}
              </p>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-10">
            <ul className="list-none space-y-10 p-0">
              <AnimatePresence mode="popLayout">
                {visibleIds.length === 0 ? (
                  <motion.li
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="list-none"
                  >
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
                      {t("blog.emptyFilter")}
                    </p>
                  </motion.li>
                ) : (
                  visibleIds.map((id, index) => <BlogArticle key={id} id={id} index={index} />)
                )}
              </AnimatePresence>
            </ul>

            <section className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 shadow-sm ring-1 ring-indigo-100 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900">{t("blog.ctaTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{t("blog.ctaSubtitle")}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/dashboard#admission-checklist"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
                >
                  {t("blog.ctaChecklist")}
                </Link>
                <Link
                  to="/dashboard#program-grid"
                  className="rounded-xl border border-indigo-300 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-900 shadow-sm transition hover:bg-indigo-50"
                >
                  {t("blog.ctaPrograms")}
                </Link>
                <Link
                  to="/profile"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  {t("blog.ctaProfile")}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BlogArticle({ id, index }: { id: BlogPostId; index: number }) {
  const { t } = useTranslation();
  const meta = BLOG_POST_META[id];
  const extra = t(`blog.${id}.extra`, { defaultValue: "" });

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.2) }}
    >
      <article
        id={`post-${id}`}
        className="scroll-mt-28 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-200/50 ring-1 ring-slate-100 sm:p-8"
        aria-labelledby={`blog-heading-${id}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <time className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t(`blog.${id}.date`)}</time>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <span className="text-xs font-medium text-slate-500">{t("blog.readTime", { min: meta.readMin })}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-indigo-800 ring-1 ring-indigo-100"
            >
              {t(`blog.tags.${tag}`)}
            </span>
          ))}
        </div>
        <h2 id={`blog-heading-${id}`} className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {t(`blog.${id}.title`)}
        </h2>
        <p className="mt-3 text-base font-medium leading-relaxed text-slate-800">{t(`blog.${id}.lead`)}</p>
        <div className="mt-4 space-y-4">
          <p className="text-sm leading-relaxed text-slate-600">{t(`blog.${id}.body`)}</p>
          {extra ? <p className="text-sm leading-relaxed text-slate-600">{extra}</p> : null}
        </div>
      </article>
    </motion.li>
  );
}
