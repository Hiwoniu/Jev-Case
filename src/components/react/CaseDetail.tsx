import {
  formatDate,
  formatMetric,
  mediaUrl,
  posterUrl,
} from "../../lib/cases";
import type { CaseItem, CaseTranslation } from "../../lib/types";

interface CaseDetailProps {
  item: CaseItem;
}

function TranslationBlock({
  translation,
}: {
  translation?: CaseTranslation;
}) {
  if (!translation) return null;

  const label = translation.targetLang.toLowerCase().startsWith("zh")
    ? "中文翻译"
    : translation.targetLang;

  return (
    <div className="translation-block">
      <span>{label}</span>
      <p>{translation.text}</p>
      <small>中文参考；原帖内容与表达以原文为准。</small>
    </div>
  );
}

export default function CaseDetail({ item }: CaseDetailProps) {
  const primary = item.media[0];
  const poster = posterUrl(primary);
  const cover = poster || "/poster-placeholder.svg";

  return (
    <article className="case-detail">
      <header className="detail-head">
        <a className="back-link" href="/">
          ← 返回案例流
        </a>
        <div className="detail-coordinates">
          <span>CASE / {item.id}</span>
          <span>原文 / {(item.lang || "und").toUpperCase()}</span>
          <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
        </div>
      </header>

      <div className="detail-grid">
        <section className="detail-media-panel" aria-label="案例媒体">
          {primary?.publicUrl ? (
            <video
              className="detail-video"
              poster={cover}
              controls
              playsInline
              preload="metadata"
            >
              <source src={mediaUrl(primary)} type="video/mp4" />
            </video>
          ) : (
            <div className="detail-unavailable">
              <img src={cover} alt="" />
              <span>视频待更新</span>
            </div>
          )}
          <div className="media-ledger">
            <span>MEDIA / {item.media.length} ITEMS</span>
          </div>
          {item.media.slice(1).map((media) => (
            <div className="secondary-media" key={media.id}>
              <span>
                {media.type.toUpperCase()} / {media.status.toUpperCase()}
              </span>
              {media.publicUrl && <a href={mediaUrl(media)}>打开文件</a>}
            </div>
          ))}
        </section>

        <div className="detail-copy">
          <div className="detail-author">
            <span className="author-avatar large">
              {item.author.avatarUrl ? <img src={item.author.avatarUrl} alt="" /> : null}
            </span>
            <span>
              <strong>{item.author.name}</strong>
              <a
                href={`https://x.com/${item.author.screenName}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                @{item.author.screenName}
              </a>
            </span>
            {item.author.verified && <span className="verified-badge">VERIFIED</span>}
          </div>

          <blockquote className="origin-text">{item.text}</blockquote>
          <TranslationBlock translation={item.translation} />

          <div className="detail-metrics">
            <div>
              <strong>{formatMetric(item.metrics.views)}</strong>
              <span>浏览</span>
            </div>
            <div>
              <strong>{formatMetric(item.metrics.likes)}</strong>
              <span>点赞</span>
            </div>
            <div>
              <strong>{formatMetric(item.metrics.bookmarks)}</strong>
              <span>收藏</span>
            </div>
            <div>
              <strong>{formatMetric(item.metrics.reposts)}</strong>
              <span>转发</span>
            </div>
          </div>

          <a
            className="source-button"
            href={item.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <span>查看 X 原帖</span>
            <span aria-hidden="true">↗</span>
          </a>

          {item.links.length > 0 && (
            <section className="detail-section">
              <h2>原创与引用</h2>
              <div className="link-list">
                {item.links.map((link) => {
                  const article = item.articles?.find(
                    (item) => item.url === link.url,
                  );
                  return (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <span>{link.domain}</span>
                      <span>
                        <strong>{article?.title || link.displayUrl || link.url}</strong>
                        {article?.description && <small>{article.description}</small>}
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {item.quoted && (
            <section className="detail-section">
              <h2>引用帖</h2>
              <article className="quote-block">
                <div className="quote-author">
                  <strong>{item.quoted.author.name}</strong>
                  <span>@{item.quoted.author.screenName}</span>
                </div>
                <p>{item.quoted.text}</p>
                <TranslationBlock translation={item.quoted.translation} />
                <div className="quote-foot">
                  <span>{formatMetric(item.quoted.metrics.views)} views</span>
                  <a
                    href={item.quoted.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    原帖 ↗
                  </a>
                </div>
              </article>
            </section>
          )}

          {item.references?.length > 0 && (
            <section className="detail-section">
              <h2>转载与衍生</h2>
              <div className="reference-list">
                {item.references.map((reference) => (
                  <article className="reference-block" key={reference.id}>
                    <div className="quote-author">
                      <strong>{reference.author.name}</strong>
                      <span>@{reference.author.screenName}</span>
                    </div>
                    <p>{reference.text}</p>
                    <TranslationBlock translation={reference.translation} />
                    <div className="quote-foot">
                      <span>{formatMetric(reference.metrics.views)} views</span>
                      <a
                        href={reference.canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        查看转载帖 ↗
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {(item.hashtags.length > 0 || item.mentions.length > 0) && (
            <section className="detail-section">
              <h2>信号标签</h2>
              <div className="tag-list">
                {item.hashtags.map((tag) => (
                  <span key={`hashtag-${tag}`}>#{tag}</span>
                ))}
                {item.mentions.map((mention) => (
                  <span key={`mention-${mention}`}>@{mention}</span>
                ))}
              </div>
            </section>
          )}

          <section className="detail-section provenance">
            <h2>来源说明</h2>
            <p>
              本条为社区整理，仅展示公开原帖与来源链接。媒体、文本、账号信息及商标权利归原作者和原平台所有。
            </p>
            <p>整理时间：{formatDate(item.curatedAt)}</p>
          </section>
        </div>
      </div>
    </article>
  );
}
