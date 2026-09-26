"use client";
import { Icon } from "./Icon";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";

type Article = {
  cover: string | null;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  readingMinutes: number;
  tags: string[];
};
type Post = {
  title: string;
  url: string;
  date: string | null;
  dateLabel: string;
  summary: string;
  topics: string[];
  embedUrl: string | null;
};
const dateLabel = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export function WritingFeed({ articles, posts }: { articles: Article[]; posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"articles" | "posts">("articles");
  const [year, setYear] = useState("all");
  const [topic, setTopic] = useState("all");
  const [order, setOrder] = useState("newest");
  const source = tab === "articles" ? articles : posts;
  const years = useMemo(
    () =>
      Array.from(new Set(source.flatMap((p) => (p.date ? [p.date.slice(0, 4)] : []))))
        .sort()
        .reverse(),
    [source],
  );
  const topics = useMemo(
    () => Array.from(new Set(source.flatMap((p) => ("tags" in p ? p.tags : p.topics)))).sort(),
    [source],
  );
  const search = query.trim().toLocaleLowerCase();
  const matches = (p: Article | Post) => {
    const tags = "tags" in p ? p.tags : p.topics;
    return (
      (year === "all" || p.date?.startsWith(year)) &&
      (topic === "all" || tags.includes(topic)) &&
      `${p.title} ${"subtitle" in p ? p.subtitle : p.summary} ${tags.join(" ")}`
        .toLocaleLowerCase()
        .includes(search)
    );
  };
  const sort = (a: { date: string | null }, b: { date: string | null }) =>
    ((Date.parse(b.date ?? "") || 0) - (Date.parse(a.date ?? "") || 0)) *
    (order === "newest" ? 1 : -1);
  const essayResults = articles.filter(matches).sort(sort);
  const postResults = posts.filter(matches).sort(sort);
  const count = tab === "articles" ? essayResults.length : postResults.length;
  const active = Boolean(query || year !== "all" || topic !== "all" || order !== "newest");
  const reset = () => {
    setQuery("");
    setYear("all");
    setTopic("all");
    setOrder("newest");
  };
  return (
    <div className="writing-archive">
      <div className="archive-tools">
        <div className="writing-tabs" role="group" aria-label="Writing type">
          <button
            aria-pressed={tab === "articles"}
            onClick={() => {
              setTab("articles");
              setYear("all");
              setTopic("all");
            }}
          >
            Essays <span>{articles.length}</span>
          </button>
          <button
            aria-pressed={tab === "posts"}
            onClick={() => {
              setTab("posts");
              setYear("all");
              setTopic("all");
            }}
          >
            LinkedIn <span>{posts.length}</span>
          </button>
        </div>
        <div className="archive-filters">
          <label className="archive-search">
            <span>Search the archive</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, idea, or topic"
            />
          </label>
          <label>
            <span>Topic</span>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Year</span>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Order</span>
            <select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
      </div>
      <div className="archive-status">
        <p role="status" aria-live="polite">
          {count} of {source.length} {tab === "articles" ? "essays" : "posts"}
          {active ? " match your filters" : " in this archive"}
        </p>
        {active && (
          <button onClick={reset}>
            Clear filters <Icon name="close" />
          </button>
        )}
      </div>
      {tab === "articles" ? (
        <div className="essay-grid">
          {essayResults.map((a, i) => (
            <article
              className={`essay-card ${i === 0 && !active ? "essay-featured" : ""}`}
              key={a.slug}
            >
              <Link href={`/writing/${a.slug}`} className="essay-link" data-hive-cursor="view">
                {a.cover && (
                  <div className="essay-art">
                    <Image
                      src={a.cover}
                      alt=""
                      fill
                      sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 767px) calc(50vw - 38px), (max-width: 1100px) calc(50vw - 50px), (max-width: 1440px) calc(50vw - 74px), 649px"
                    />
                  </div>
                )}
                <div className="essay-copy">
                  <div className="essay-meta">
                    <time dateTime={a.date}>{dateLabel(a.date)}</time>
                    <span>{a.readingMinutes} min read</span>
                  </div>
                  <h2>{a.title}</h2>
                  <p>{a.subtitle}</p>
                  <div className="essay-footer">
                    <span className="essay-topics">{a.tags.join(" / ")}</span>
                    <span className="essay-read">
                      Read essay <Icon name="arrow-up-right" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="notes-list">
          {postResults.map((p) => (
            <article className="archive-note" key={p.url}>
              <div className="note-date">
                {p.date ? <time dateTime={p.date}>{dateLabel(p.date)}</time> : p.dateLabel}
                <span>LinkedIn</span>
              </div>
              <div>
                <h2>
                  <a href={p.url} target="_blank" rel="noreferrer">
                    {p.title} <Icon name="arrow-up-right" />
                  </a>
                </h2>
                <p>{p.summary}</p>
                <div className="tag-list">
                  {p.topics.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
                {p.embedUrl && <LinkedInEmbed url={p.embedUrl} title={p.title} />}
                <a href={p.url} className="text-link" target="_blank" rel="noreferrer">
                  Read the original post <Icon name="arrow-up-right" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
      {count === 0 && (
        <div className="archive-empty">
          <h2>No writing matches those filters.</h2>
          <p>Try a broader topic, another year, or a shorter search.</p>
          <button className="text-link" onClick={reset}>
            Show all {tab === "articles" ? "essays" : "posts"} <Icon name="arrow-right" />
          </button>
        </div>
      )}
    </div>
  );
}
function LinkedInEmbed({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return loaded ? (
    <iframe
      className="linkedin-embed"
      src={url}
      title={`LinkedIn post: ${title}`}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  ) : (
    <button className="embed-load" onClick={() => setLoaded(true)}>
      Load official LinkedIn embed <Icon name="arrow-up-right" />
      <span>Connects to LinkedIn when opened.</span>
    </button>
  );
}
