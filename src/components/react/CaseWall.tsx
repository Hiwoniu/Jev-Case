import { useEffect, useMemo, useRef, useState } from "react";
import { getHotScore } from "../../lib/cases";
import type { CaseItem } from "../../lib/types";
import CaseCard from "./CaseCard";

type SortMode = "hot" | "new" | "video" | "links";
type FilterMode = "all" | "zh" | "quote" | "links";

// ponytail: editorial headline counters; replace with live totals once they catch up.
const HEADLINE_STATS = {
  totalViews: "1亿+",
  linkCount: "2000+",
};

interface CaseWallProps {
  cases: CaseItem[];
  scoreReferenceTime: string;
}

export default function CaseWall({
  cases,
  scoreReferenceTime,
}: CaseWallProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("hot");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [hydrated, setHydrated] = useState(false);
  const frame = useRef(0);
  const scoreTime = new Date(scoreReferenceTime).getTime();

  const videoCount = cases.filter((item) =>
    item.media.some((media) => media.type === "video"),
  ).length;

  const visibleCases = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = cases.filter((item) => {
      const searchText = [
        item.text,
        item.translation?.text ?? "",
        item.author.name,
        item.author.screenName,
        ...item.hashtags,
        ...item.mentions,
        ...item.links.map((link) => link.domain),
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !needle || searchText.includes(needle);
      const matchesFilter =
        filter === "all" ||
        (filter === "zh" && item.lang === "zh") ||
        (filter === "quote" && Boolean(item.quoted)) ||
        (filter === "links" && item.links.length > 0);
      return matchesQuery && matchesFilter;
    });

    return filtered.sort((a, b) => {
      if (sort === "new") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === "video") {
        return (
          Number(b.media.some((media) => media.type === "video")) -
            Number(a.media.some((media) => media.type === "video")) ||
          getHotScore(b, scoreTime) - getHotScore(a, scoreTime)
        );
      }
      if (sort === "links") {
        return (
          b.links.length - a.links.length ||
          getHotScore(b, scoreTime) - getHotScore(a, scoreTime)
        );
      }
      return getHotScore(b, scoreTime) - getHotScore(a, scoreTime);
    });
  }, [cases, filter, query, scoreTime, sort]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const refreshPlayback = () => {
      const active = Array.from(document.querySelectorAll<HTMLVideoElement>(
        "[data-case-card] video",
      ));
      let best: { video: HTMLVideoElement; area: number } | null = null;

      for (const video of active) {
        const rect = video.getBoundingClientRect();
        const width = Math.max(
          0,
          Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
        );
        const height = Math.max(
          0,
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
        );
        const area = width * height;
        if (area > 0 && (!best || area > best.area)) {
          best = { video, area };
        }
      }

      for (const video of active) {
        if (reduceMotion || video !== best?.video || document.hidden) {
          video.pause();
        } else {
          video.play().catch(() => {});
        }
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(refreshPlayback);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      cancelAnimationFrame(frame.current);
    };
  }, [visibleCases]);

  return (
    <div data-case-wall-ready={hydrated ? "true" : "false"}>
      <section className="signal-head" aria-labelledby="page-title">
        <div className="signal-title-block">
          <p className="eyebrow">BATCH COMMUNITY INDEX / NON-OFFICIAL</p>
          <h1 id="page-title">
            JEV 在 X 上，<br />
            <span>正在长成什么。</span>
          </h1>
        </div>
        <div className="signal-stats" aria-label="案例库统计">
          <div>
            <strong>{cases.length}</strong>
            <span>案例原帖</span>
          </div>
          <div>
            <strong>{videoCount}</strong>
            <span>带视频</span>
          </div>
          <div>
            <strong>{HEADLINE_STATS.totalViews}</strong>
            <span>总浏览</span>
          </div>
          <div>
            <strong>{HEADLINE_STATS.linkCount}</strong>
            <span>外链引用</span>
          </div>
        </div>
      </section>

      <section className="case-wall" aria-labelledby="wall-title">
        <div className="wall-toolbar">
          <div className="toolbar-heading">
            <h2 id="wall-title">案例流</h2>
            <span>{visibleCases.length} 条信号</span>
          </div>

          <label className="search-field">
            <span>搜索</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="作者、原文、标签或域名"
              autoComplete="off"
            />
          </label>

          <div className="control-row">
            <div className="segmented" aria-label="排序方式">
              {(
                [
                  ["hot", "热门"],
                  ["new", "最新"],
                  ["video", "视频优先"],
                  ["links", "外链优先"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={sort === value ? "is-active" : ""}
                  onClick={() => setSort(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="segmented filters" aria-label="筛选条件">
              {(
                [
                  ["all", "全部"],
                  ["zh", "中文"],
                  ["quote", "引用"],
                  ["links", "外链"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={filter === value ? "is-active" : ""}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {visibleCases.length > 0 ? (
          <div className="case-grid">
            {visibleCases.map((item, index) => (
              <CaseCard
                key={item.id}
                item={item}
                index={index}
                hotScore={getHotScore(item, scoreTime)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">NO MATCHING SIGNAL</p>
            <h2>没有匹配的案例</h2>
            <p>清除搜索或切换筛选条件后重试。</p>
          </div>
        )}
      </section>
    </div>
  );
}
