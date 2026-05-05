import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number, decimals = 2): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(decimals);
}

export function formatDate(date: string | Date, style: "short" | "long" = "short"): string {
  const d = new Date(date);
  if (style === "long") {
    return d.toLocaleDateString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = [
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s);
    if (count >= 1) return `${count}${label} ago`;
  }
  return "just now";
}

export function ratingTier(rating: number): { label: string; color: string } {
  if (rating >= 2000) return { label: "Grandmaster", color: "text-gold" };
  if (rating >= 1800) return { label: "Diamond", color: "text-purple-400" };
  if (rating >= 1600) return { label: "Platinum", color: "text-cyan-400" };
  if (rating >= 1400) return { label: "Gold", color: "text-yellow-400" };
  if (rating >= 1200) return { label: "Silver", color: "text-gray-400" };
  return { label: "Bronze", color: "text-bronze" };
}
