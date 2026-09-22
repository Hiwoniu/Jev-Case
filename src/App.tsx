import { useEffect, useState } from "react";
import CaseDetail from "./components/react/CaseDetail";
import CaseWall from "./components/react/CaseWall";
import rawCases from "./data/cases.json";
import { posterUrl } from "./lib/cases";
import type { CaseDatabase, CaseItem } from "./lib/types";

const database = rawCases as CaseDatabase;
const aliases = new Map(
  database.aliases.map((alias) => [alias.id, alias.canonicalCaseId]),
);

type Route =
  | { kind: "home" }
  | { kind: "case"; item: CaseItem }
  | { kind: "not-found" };

function readRoute(): Route {
  const pathname = window.location.pathname.replace(/\/+$/u, "") || "/";
  if (pathname === "/") return { kind: "home" };

  const match = pathname.match(/^\/case\/([^/]+)$/u);
  if (!match) return { kind: "not-found" };

  const requestedId = decodeURIComponent(match[1]);
  const canonicalId = aliases.get(requestedId) ?? requestedId;
  if (canonicalId !== requestedId) {
    window.history.replaceState({}, "", `/case/${canonicalId}`);
  }

  const item = database.cases.find((candidate) => candidate.id === canonicalId);
  return item ? { kind: "case", item } : { kind: "not-found" };
}

function setMeta(attribute: "name" | "property", key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = value;
}

function NotFound() {
  return (
    <section className="empty-state full">
      <p className="eyebrow">404 / SIGNAL LOST</p>
      <h1>这条信号不存在。</h1>
      <a className="source-button compact" href="/">
        返回案例流
      </a>
    </section>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => readRoute());

  useEffect(() => {
    const handlePopState = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        !/^\/(?:case\/[^/]+)?$/u.test(url.pathname)
      ) {
        return;
      }

      event.preventDefault();
      window.history.pushState({}, "", url.pathname);
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const item = route.kind === "case" ? route.item : undefined;
    const title = item
      ? `${item.author.name} · JEV 案例`
      : route.kind === "home"
        ? "JEV Signal | X 社区案例信号墙"
        : "Signal not found | JEV Signal";
    const description = item
      ? item.text.slice(0, 180)
      : route.kind === "home"
        ? "浏览 X 上基于 JEV / TypeSafe 的公开视频案例、原帖、引用与外链。"
        : "没有找到这条案例。";
    const path = item ? `/case/${item.id}` : route.kind === "home" ? "/" : "/404";
    const canonicalURL = new URL(path, window.location.origin).toString();
    const image = item ? posterUrl(item.media[0]) : undefined;

    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalURL);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = canonicalURL;

    if (image) {
      setMeta("property", "og:image", image);
      setMeta("name", "twitter:card", "summary_large_image");
      setMeta("name", "twitter:image", image);
    } else {
      document.head
        .querySelector('meta[property="og:image"]')
        ?.remove();
      document.head
        .querySelector('meta[name="twitter:image"]')
        ?.remove();
      setMeta("name", "twitter:card", "summary");
    }

    const structuredData = document.getElementById("case-structured-data");
    if (!item) {
      structuredData?.remove();
      return;
    }

    const script =
      structuredData instanceof HTMLScriptElement
        ? structuredData
        : document.createElement("script");
    script.id = "case-structured-data";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SocialMediaPosting",
      headline: `${item.author.name} 的 JEV 案例`,
      datePublished: item.createdAt,
      articleBody: item.text,
      url: item.canonicalUrl,
      image,
      author: {
        "@type": "Person",
        name: item.author.name,
        alternateName: `@${item.author.screenName}`,
      },
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/ViewAction",
          userInteractionCount: item.metrics.views,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: item.metrics.likes,
        },
      ],
    });
    if (!script.isConnected) document.head.append(script);
  }, [route]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="JEV Signal 首页">
          <span className="brand-mark">JEV</span>
          <span className="brand-name">SIGNAL</span>
        </a>
        <div className="header-meta">
          <span className="live-dot" aria-hidden="true" />
          <span>社区案例信号墙</span>
        </div>
        <nav className="header-nav" aria-label="主导航">
          <label className="translation-switch">
            <input type="checkbox" aria-label="中文翻译" />
            <span className="translation-option translation-original">原文</span>
            <span className="translation-option translation-chinese">中文</span>
          </label>
          <a href="/">案例</a>
          <a
            href="https://x.com/search?q=Jev&src=typed_query&f=top"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看 X
          </a>
        </nav>
      </header>

      <main>
        {route.kind === "home" && (
          <CaseWall
            cases={database.cases}
            scoreReferenceTime={new Date().toISOString()}
          />
        )}
        {route.kind === "case" && <CaseDetail item={route.item} />}
        {route.kind === "not-found" && <NotFound />}
      </main>

      <footer className="site-footer">
        <p>
          非官方社区整理，与 JEV / TypeSafe 无隶属关系。原帖、视频及商标权利归原作者所有。
        </p>
        <p className="footer-tech">STATIC SIGNAL / DATA ONLY / ORIGINALS LINKED</p>
      </footer>
    </div>
  );
}
