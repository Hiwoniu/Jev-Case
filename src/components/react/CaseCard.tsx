import {
  compactText,
  formatMetric,
  mediaUrl,
  posterUrl,
} from "../../lib/cases";
import type { CaseItem } from "../../lib/types";

interface CaseCardProps {
  item: CaseItem;
  hotScore: number;
  index: number;
}

export default function CaseCard({
  item,
  hotScore,
  index,
}: CaseCardProps) {
  const video = item.media.find(
    (media) =>
      (media.type === "video" || media.type === "gif") && media.publicUrl,
  );
  const poster = posterUrl(video ?? item.media[0]);
  const src = mediaUrl(video);
  const cover = poster || "/poster-placeholder.svg";

  return (
    <a
      className="case-card"
      href={`/case/${item.id}`}
      data-case-card
      data-language={item.lang}
      data-video={video ? "true" : "false"}
      data-links={item.links.length ? "true" : "false"}
      data-quote={item.quoted ? "true" : "false"}
      data-hot={hotScore.toFixed(8)}
      data-created={new Date(item.createdAt).getTime()}
    >
      <div className="case-visual">
        <span className="case-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="case-signal">{item.lang || "??"}</span>
        {src ? (
          <video
            poster={cover}
            preload="none"
            muted
            playsInline
            loop
            aria-label={`${item.author.name} 的视频案例`}
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : (
          <img
            src={cover}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.src = "/poster-placeholder.svg";
            }}
          />
        )}
        <span className="case-scanline" aria-hidden="true" />
      </div>

      <div className="case-card-body">
        <div className="case-author">
          <span className="author-avatar">
            {item.author.avatarUrl ? (
              <img
                src={item.author.avatarUrl}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : null}
          </span>
          <span className="author-copy">
            <strong>{item.author.name}</strong>
            <small>
              @{item.author.screenName}
              {item.author.verified ? " · verified" : ""}
            </small>
          </span>
        </div>

        <p className="case-text original-text">{compactText(item.text)}</p>
        {item.translation?.text && (
          <p className="case-text translated-text">
            {compactText(item.translation.text)}
          </p>
        )}

        <div className="case-metrics" aria-label="原帖互动指标">
          <span>
            <b>{formatMetric(item.metrics.views)}</b> views
          </span>
          <span>
            <b>{formatMetric(item.metrics.likes)}</b> likes
          </span>
          <span>
            <b>{formatMetric(item.metrics.bookmarks)}</b> saves
          </span>
        </div>

        <div className="case-flags">
          {item.quoted && <span className="flag quote-flag">引用</span>}
          {item.links.length > 0 && (
            <span className="flag link-flag">外链 {item.links.length}</span>
          )}
          {item.references?.length > 0 && (
            <span className="flag quote-flag">
              合并转载 {item.references.length}
            </span>
          )}
          {item.translation?.text && (
            <span className="flag translation-flag">中文</span>
          )}
          {item.mediaStatus !== "ready" && (
            <span className="flag muted-flag">媒体待更新</span>
          )}
        </div>
      </div>
    </a>
  );
}
