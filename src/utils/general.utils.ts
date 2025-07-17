import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function createIndex<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T> {
  const result = {} as Record<K, T>;
  for (const item of array) {
    const key = keyFn(item);
    result[key] = item;
  }
  return result;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
