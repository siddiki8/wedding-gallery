import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

/**
 * Checks if an image URL is valid by attempting to load it
 * @param url The URL to check
 * @returns A promise resolving to true if the URL is valid, false otherwise
 */
export async function isImageUrlValid(url: string): Promise<boolean> {
  if (!url) return false
  
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.error(`Error checking image URL ${url}:`, error)
    return false
  }
}

