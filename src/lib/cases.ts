import rawCases from "../data/cases.json";
import type { CaseDatabase, CaseItem, CaseMedia } from "./types";

const database = rawCases as CaseDatabase;

if (database.schemaVersion !== 1 || !Array.isArray(database.cases)) {
  throw new Error("cases.json does not match schemaVersion 1");
}

export function getCases(): CaseItem[] {
  return database.cases;
}

export function getCaseAliases() {
  return database.aliases ?? [];
}

export function getGeneratedAt(): string {
  return database.generatedAt;
}

export function getHotScore(
  item: CaseItem,
  referenceTime = Date.now(),
): number {
  const { views, likes, bookmarks, reposts } = item.metrics;
  const signal =
    Math.log10(views + 1) * 0.45 +
    Math.log10(likes + 1) * 0.25 +
    Math.log10(bookmarks + 1) * 0.2 +
    Math.log10(reposts + 1) * 0.1;
  const ageHours = Math.max(
    0,
    (referenceTime - new Date(item.createdAt).getTime()) / 3_600_000,
  );

  return signal * 0.5 ** (ageHours / 72);
}

export function mediaUrl(
  media: CaseMedia | undefined,
): string | undefined {
  return media?.publicUrl;
}

export function posterUrl(
  media: CaseMedia | undefined,
): string | undefined {
  return media?.posterPublicUrl;
}

export function formatMetric(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}亿`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(1)}万`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

export function compactText(value: string, length = 210): string {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
}
