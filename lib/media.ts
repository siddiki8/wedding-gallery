import { db } from "@/lib/db"
import type { Media } from "@/lib/types"
import { isMediaUrlValid } from "@/lib/utils"

export type SortOption = "recent" | "oldest" | "likes"
export type MediaTypeFilter = "all" | "images" | "videos"

/**
 * Retrieves all valid media from the database
 * If cleanupDeleted is true, it will also remove references to deleted media
 */
export async function getMedia(options: { 
  cleanupDeleted?: boolean;
  sortBy?: SortOption;
  type?: MediaTypeFilter;
} = {}): Promise<Media[]> {
  const { cleanupDeleted = true, sortBy = "recent", type = "all" } = options;
  
  try {
    // Determine the sort order
    const orderBy = {
      recent: { createdAt: "desc" as const },
      oldest: { createdAt: "asc" as const },
      likes: { likes: "desc" as const },
    }[sortBy];
    
    // Prepare the where clause for filtering by type
    const where = type === "all" 
      ? {} 
      : { type: type === "images" ? "image" : "video" };
    
    // Get all media from database using the Media model
    const mediaItems = await db.media.findMany({
      orderBy,
      where,
    });

    // Create an array to collect invalid media IDs
    const invalidMediaIds: string[] = [];
    const validMediaItems: Media[] = [];

    // Check each media URL
    for (const item of mediaItems) {
      const isValid = await isMediaUrlValid(item.url, item.type);
      
      if (isValid) {
        // Keep valid media
        validMediaItems.push(item as unknown as Media);
      } else {
        // Track invalid media IDs for cleanup
        invalidMediaIds.push(item.id);
        console.log(`Found invalid ${item.type} URL: ${item.url} for ID: ${item.id}`);
      }
    }

    // Optionally clean up invalid media references from database
    if (cleanupDeleted && invalidMediaIds.length > 0) {
      try {
        const deleteResult = await db.media.deleteMany({
          where: {
            id: {
              in: invalidMediaIds
            }
          }
        });
        console.log(`Cleaned up ${deleteResult.count} deleted media items from database`);
      } catch (cleanupError) {
        console.error("Error cleaning up deleted media:", cleanupError);
      }
    }

    return validMediaItems;
  } catch (error) {
    console.error("Error fetching media:", error);
    return [];
  }
}

/**
 * Backwards compatibility function for getPhotos
 */
export async function getPhotos(options: { 
  cleanupDeleted?: boolean;
  sortBy?: SortOption;
} = {}): Promise<Media[]> {
  return getMedia({ ...options, type: "images" });
}

/**
 * Initiates a cleanup of deleted media without returning data
 * Useful for scheduled cleanup jobs
 */
export async function cleanupDeletedMedia(): Promise<{ removed: number }> {
  try {
    // Get all media from database
    const mediaItems = await db.media.findMany({
      select: {
        id: true,
        url: true,
        type: true,
      }
    });

    // Create an array to collect invalid media IDs
    const invalidMediaIds: string[] = [];

    // Check each media URL
    for (const item of mediaItems) {
      const isValid = await isMediaUrlValid(item.url, item.type);
      
      if (!isValid) {
        invalidMediaIds.push(item.id);
      }
    }

    // Delete invalid media
    if (invalidMediaIds.length > 0) {
      const deleteResult = await db.media.deleteMany({
        where: {
          id: {
            in: invalidMediaIds
          }
        }
      });
      
      return { removed: deleteResult.count };
    }

    return { removed: 0 };
  } catch (error) {
    console.error("Error cleaning up media:", error);
    return { removed: 0 };
  }
}

/**
 * Backwards compatibility function for cleanupDeletedPhotos
 */
export async function cleanupDeletedPhotos(): Promise<{ removed: number }> {
  return cleanupDeletedMedia();
} 