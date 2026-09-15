"use client";
import { Icon } from "./Icon";
import Link from "next/link";
import { SplitText } from "./Motion";
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
export function WritingFeed({ articles, posts }: { articles: Article[]; posts: Post[] }) {
  const [query, setQuery] = useState(""),
    [tab, setTab] = useState("articles"),
    [year, setYear] = useState("all");
  const years = useMemo(
    () =>
      Array.from(new Set([...articles, ...posts].map((p) => p.date?.slice(0, 4)).filter(Boolean)))
        .sort()
        .reverse(),
    [articles, posts],
  );
  const filteredArticles = articles.filter(
    (a) =>
      (year === "all" || a.date.startsWith(year)) &&
      `${a.title} ${a.subtitle} ${a.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredPosts = posts.filter(
    (p) =>
      (year === "all" || p.date?.startsWith(year)) &&
      `${p.title} ${p.summary} ${p.topics.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="writing-controls">
        <div className="writing-tabs" role="group" aria-label="Writing type">
          <button aria-pressed={tab === "articles"} onClick={() => setTab("articles")}>
            Essays <span>{articles.length}</span>
          </button>
          <button aria-pressed={tab === "posts"} onClick={() => setTab("posts")}>
            LinkedIn <span>{posts.length}</span>
          </button>
        </div>
        <div className="writing-filters">
          <label>
            <span className="sr-only">Search by title or topic</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or topic"
            />
          </label>
          <label>
            <span className="sr-only">Filter by year</span>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="writing-list">
        {tab === "articles"
          ? filteredArticles.map((a) => (
              <Link
                className="writing-row"
                data-hive-cursor="view"
                href={`/writing/${a.slug}`}
                key={a.slug}
              >
                <time dateTime={a.date}>
                  {new Date(a.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
                <div>
                  <SplitText as="h2" text={a.title} by="word" />
                  <p>{a.subtitle}</p>
                  <div className="tag-list">
                    <span className="tag">{a.readingMinutes} min read</span>
                    {a.tags.slice(0, 3).map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span aria-hidden="true">
                  <Icon name="arrow-up-right" />
                </span>
                {a.cover && (
                  <span className="writing-cover" data-hive-cursor="view">
                    <Image src={a.cover} alt="" width={240} height={150} unoptimized />
                  </span>
                )}
              </Link>
            ))
          : filteredPosts.map((p) => (
              <article className="linkedin-post" key={p.url}>
                <div className="writing-row">
                  <span className="eyebrow">{p.dateLabel}</span>
                  <div>
                    <a href={p.url} target="_blank" rel="noreferrer">
                      <SplitText as="h2" text={p.title} by="word" />
                    </a>
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
                      View on LinkedIn <Icon name="arrow-up-right" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
      </div>
      {(tab === "articles" ? filteredArticles : filteredPosts).length === 0 && (
        <p className="empty-results" role="status">
          No results for this search. Try another title or topic.
        </p>
      )}
    </>
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
