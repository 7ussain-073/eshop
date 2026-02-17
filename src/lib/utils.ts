import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Local storage helpers for client-only category hiding (used when DB migration
// hasn't added a persistent `hidden` column). Stored value = array of category ids.
const LOCAL_HIDDEN_KEY = "localHiddenCategories";

export function getLocalHiddenCategories(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_HIDDEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLocalHiddenCategories(ids: string[]) {
  try {
    localStorage.setItem(LOCAL_HIDDEN_KEY, JSON.stringify(ids));
  } catch {}
}