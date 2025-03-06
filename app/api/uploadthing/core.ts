import { createUploadthing, type FileRouter } from "uploadthing/next"
import { db } from "@/lib/db"
import { z } from "zod"

// Create new UploadThing instance
const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } })
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
      console.log("Metadata in onUploadComplete:", metadata);
      
      try {
        // Save file info to database
        const savedPhoto = await db.photo.create({
          data: {
            url: file.url,
            name: metadata.userName || "Unknown User",
          },
        });
        
        console.log("Successfully saved photo to database:", savedPhoto.id);
        console.log("Photo saved with name:", metadata.userName);
        
        return { uploadedBy: metadata.userName };
      } catch (dbError) {
        console.error("Database error:", dbError);
        return { error: "Failed to save to database" };
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

