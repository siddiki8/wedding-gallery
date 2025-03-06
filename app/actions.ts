"use server"

import { db } from "@/lib/db"
import type { Message, Media } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function saveEmail(data: { name: string; email: string }) {
  try {
    // Check if email already exists
    const existingEmail = await db.email.findUnique({
      where: { email: data.email }
    });

    if (existingEmail) {
      // If email exists, just update the name
      const updated = await db.email.update({
        where: { email: data.email },
        data: { name: data.name }
      });
      return { success: true, email: updated }
    } else {
      // Otherwise create a new record
      const email = await db.email.create({
        data: {
          name: data.name,
          email: data.email,
        },
      });
      return { success: true, email }
    }
  } catch (error) {
    console.error("Error saving email:", error);
    return { success: false, error: "Failed to save email" }
  }
}

export async function saveMessage(data: { content: string; name: string }): Promise<{ success: boolean; message?: Message; error?: string }> {
  try {
    // Use a raw query to create the message
    // This is a workaround for the Prisma client type issue
    const result = await db.$queryRaw`
      INSERT INTO "Message" ("id", "content", "name", "createdAt") 
      VALUES (gen_random_uuid(), ${data.content}, ${data.name}, NOW())
      RETURNING *
    `;
    
    // Convert the result to a Message object
    const createdMessage = Array.isArray(result) && result.length > 0 
      ? result[0] as unknown as Message 
      : null;
    
    if (!createdMessage) {
      throw new Error("Failed to create message");
    }
    
    // Revalidate the messages page
    revalidatePath('/messages');
    
    return { success: true, message: createdMessage };
  } catch (error) {
    console.error("Error saving message:", error);
    return { success: false, error: "Failed to save message" };
  }
}

/**
 * Toggle like status for a media item (photo or video)
 */
export async function toggleLikePhoto(mediaId: string): Promise<{ success: boolean; likes: number; error?: string }> {
  try {
    // Use a raw query to update the likes count in the Media table
    const result = await db.$queryRaw`
      UPDATE "Media" 
      SET "likes" = "likes" + 1 
      WHERE "id" = ${mediaId}
      RETURNING "likes"
    `;
    
    // Extract the updated likes count
    const updatedLikes = Array.isArray(result) && result.length > 0 
      ? (result[0] as any).likes as number
      : null;
    
    if (updatedLikes === null) {
      return { success: false, likes: 0, error: "Media not found" };
    }
    
    // Revalidate the gallery page
    revalidatePath('/gallery');
    
    return { success: true, likes: updatedLikes };
  } catch (error) {
    console.error("Error liking media:", error);
    return { success: false, likes: 0, error: "Failed to like media" };
  }
} 