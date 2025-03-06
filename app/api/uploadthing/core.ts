import { createUploadthing, type FileRouter } from "uploadthing/next"
import { db } from "@/lib/db"
import { z } from "zod"

// Create new UploadThing instance
const f = createUploadthing()

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    video: { maxFileSize: "1GB", maxFileCount: 5 }
  })
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
      })
    )
    .middleware(async ({ input }) => {
      // Log input data
      console.log("Middleware received input:", input);
      
      // Return the metadata - whatever you return here is passed to onUploadComplete
      return {
        userName: input.name,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete with file:", file.name);
      console.log("File type:", file.type);
      console.log("Metadata in onUploadComplete:", metadata);
      
      // Determine if it's a video or image
      const isVideo = file.type.startsWith('video/');
      
      try {
        // Save to database using the Media model
        const savedMedia = await db.media.create({
          data: {
            url: file.url,
            name: metadata.userName || "Unknown User",
            type: isVideo ? "video" : "image",
            fileType: file.type,
            size: file.size,
            // For videos, we'll update thumbnails later if needed
            thumbnail: isVideo ? null : null,
          },
        });
        
        console.log(`Successfully saved ${isVideo ? 'video' : 'image'} to database:`, savedMedia.id);
        
        return { 
          uploadedBy: metadata.userName,
          mediaId: savedMedia.id,
          mediaType: isVideo ? "video" : "image"
        };
      } catch (dbError) {
        console.error("Database error:", dbError);
        return { error: "Failed to save to database" };
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

