import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency in Indian Rupees */
export function formatPrice(amount: number | string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

/** Format date */
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy");
}

/** Format date with time */
export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy, hh:mm a");
}

/** Discount percentage */
export function discountPercent(price: number, comparePrice: number): number {
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/** Truncate text */
export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + "…" : text;
}

/** Order status label + color */
export const ORDER_STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending:    { label: "Pending",    color: "text-yellow-400", bg: "bg-yellow-400/10" },
  confirmed:  { label: "Confirmed",  color: "text-blue-400",   bg: "bg-blue-400/10" },
  processing: { label: "Processing", color: "text-purple-400", bg: "bg-purple-400/10" },
  shipped:    { label: "Shipped",    color: "text-cyan-400",   bg: "bg-cyan-400/10" },
  delivered:  { label: "Delivered",  color: "text-green-400",  bg: "bg-green-400/10" },
  cancelled:  { label: "Cancelled",  color: "text-red-400",    bg: "bg-red-400/10" },
  refunded:   { label: "Refunded",   color: "text-gray-400",   bg: "bg-gray-400/10" },
};

/** Star rating array */
export function getStars(rating: number): ("full" | "half" | "empty")[] {
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return "full";
    if (i < rating) return "half";
    return "empty";
  });
}
