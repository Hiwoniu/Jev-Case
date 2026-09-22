export interface CaseMetrics {
  views: number;
  likes: number;
  bookmarks: number;
  reposts: number;
  replies: number;
  quotes: number;
}

export interface CaseAuthor {
  name: string;
  screenName: string;
  avatarUrl?: string;
  verified: boolean;
  followers?: number;
}

export interface CaseMedia {
  id: string;
  type: "video" | "gif" | "photo";
  publicUrl?: string;
  posterPublicUrl?: string;
  width?: number;
  height?: number;
  durationMs?: number;
  status: "ready" | "pending" | "failed";
}

export interface CaseLink {
  url: string;
  displayUrl?: string;
  domain: string;
}

export interface CaseArticle {
  url: string;
  domain: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface QuotedCase {
  id: string;
  canonicalUrl: string;
  author: CaseAuthor;
  createdAt: string;
  text: string;
  lang?: string;
  translation?: CaseTranslation;
  metrics: CaseMetrics;
}

export interface CaseTranslation {
  status: "ready";
  text: string;
  targetLang: string;
  detectedLang?: string;
}

export interface CaseReference {
  id: string;
  canonicalUrl: string;
  author: CaseAuthor;
  createdAt: string;
  text: string;
  lang?: string;
  translation?: CaseTranslation;
  metrics: CaseMetrics;
}

export interface CaseAlias {
  id: string;
  canonicalCaseId: string;
}

export interface CaseItem {
  id: string;
  canonicalUrl: string;
  author: CaseAuthor;
  createdAt: string;
  text: string;
  lang: string;
  metrics: CaseMetrics;
  media: CaseMedia[];
  quoted: QuotedCase | null;
  links: CaseLink[];
  articles: CaseArticle[];
  references: CaseReference[];
  translation?: CaseTranslation;
  hashtags: string[];
  mentions: string[];
  mediaStatus: "ready" | "partial" | "pending" | "failed";
  curatedAt: string;
}

export interface CaseDatabase {
  schemaVersion: 1;
  generatedAt: string;
  aliases: CaseAlias[];
  cases: CaseItem[];
}
