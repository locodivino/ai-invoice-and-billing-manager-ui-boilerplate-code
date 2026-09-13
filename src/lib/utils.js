import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n, opts = {}) {
  return new Intl.NumberFormat("en-US", opts).format(n);
}

export const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "CAD", symbol: "$" },
  { code: "AUD", symbol: "$" },
  { code: "JPY", symbol: "¥" },
];

export function formatMoney(amount, currency = "USD") {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export function formatDate(date, opts = { month: "short", day: "numeric", year: "numeric" }) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", opts);
}

// Convert any date to a YYYY-MM-DD string for <input type="date"> / API.
export function toDateInput(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function relativeTime(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

// Whitelist image sources for <img src> / @react-pdf <Image src> (logos).
// Rejects javascript: URLs and data URIs that carry executable payloads
// (<script>/<foreignObject>/<onerror>/...) which could be used for DOM XSS.
const IMAGE_DATA_RE = /^data:image\/(png|jpe?g|gif|webp)(;base64)?,/i;
const IMAGE_SVG_DATA_RE = /^data:image\/svg\+xml(;base64)?,/i;
const IMAGE_HTTP_RE = /^https?:\/\/[^\s]+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;
const BLOCKED_IN_SVG = /<\s*script|<\s*foreignobject|javascript:|<\s*iframe|onerror\s*=|onload\s*=/i;

export function sanitizeImageSrc(src) {
  if (!src || typeof src !== "string") return "";
  const value = src.trim();
  if (/^javascript:/i.test(value)) return "";
  if (IMAGE_DATA_RE.test(value)) return value; // raster data URIs are inert
  if (IMAGE_SVG_DATA_RE.test(value) && !BLOCKED_IN_SVG.test(value)) return value;
  if (IMAGE_HTTP_RE.test(value)) return value;
  return ""; // anything else (data:text, schemes, non-image paths) is rejected
}
