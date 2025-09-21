import { clsx, type ClassValue } from "clsx";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { twMerge } from "tailwind-merge";

export function encode<T>(data: T): string {
  const stringified = JSON.stringify(data);
  return compressToEncodedURIComponent(stringified);
}

export function decode<T>(str: string): T {
  const json = decompressFromEncodedURIComponent(str);
  if (!json) {
    throw new Error("Failed to decompress string");
  }
  return JSON.parse(json) as T;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
