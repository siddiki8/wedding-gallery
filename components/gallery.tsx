"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Photo } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Camera, User, AlertCircle, Heart } from "lucide-react"
import { toggleLikePhoto } from "@/app/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface GalleryProps {
  photos: Photo[]
}

export function Gallery({ photos }: GalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [likedPhotos, setLikedPhotos] = useState<Record<string, number>>({})
  const [userLikedPhotos, setUserLikedPhotos] = useState<Set<string>>(new Set())
  const [doubleTapTimer, setDoubleTapTimer] = useState<Record<string, NodeJS.Timeout | null>>({})

  // Load previously liked photos from localStorage
  useEffect(() => {
    try {
      const likedPhotosJson = localStorage.getItem('userLikedPhotos')
      if (likedPhotosJson) {
        const likedPhotoIds = JSON.parse(likedPhotosJson)
        if (Array.isArray(likedPhotoIds)) {
          setUserLikedPhotos(new Set(likedPhotoIds))
        }
      }
    } catch (error) {
      console.error("Error loading liked photos from localStorage:", error)
    }
  }, [])

  const handleImageError = (photoId: string) => {
    setFailedImages(prev => {
      const newSet = new Set(prev)
      newSet.add(photoId)
      return newSet
    })
  }

  // Handle liking a photo
  const handleLikePhoto = async (photoId: string, event?: React.MouseEvent) => {
    // Prevent event bubbling if this is a click event
    if (event) {
      event.stopPropagation()
    }
    
    // Check if user has already liked this photo
    if (userLikedPhotos.has(photoId)) {
      toast.info("You've already liked this photo!")
      return
    }
    
    // Optimistically update the UI
    setLikedPhotos(prev => ({
      ...prev,
      [photoId]: (prev[photoId] || photos.find(p => p.id === photoId)?.likes || 0) + 1
    }))
    
    // Add to user liked photos set
    const newUserLikedPhotos = new Set(userLikedPhotos)
    newUserLikedPhotos.add(photoId)
    setUserLikedPhotos(newUserLikedPhotos)
    
    // Save to localStorage
    try {
      localStorage.setItem('userLikedPhotos', JSON.stringify([...newUserLikedPhotos]))
    } catch (error) {
      console.error("Error saving liked photos to localStorage:", error)
    }
    
    // Call the server action
    try {
      const result = await toggleLikePhoto(photoId)
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Update with the actual count from the server
      if (result.likes !== undefined) {
        setLikedPhotos(prev => ({
          ...prev,
          [photoId]: result.likes!
        }))
      }
    } catch (error) {
      console.error("Error liking photo:", error)
      toast.error("Failed to like photo. Please try again.")
      
      // Revert the optimistic update
      setLikedPhotos(prev => ({
        ...prev,
        [photoId]: (prev[photoId] || 0) - 1
      }))
      
      // Remove from user liked photos
      const revertedUserLikedPhotos = new Set(userLikedPhotos)
      revertedUserLikedPhotos.delete(photoId)
      setUserLikedPhotos(revertedUserLikedPhotos)
      
      // Update localStorage
      try {
        localStorage.setItem('userLikedPhotos', JSON.stringify([...revertedUserLikedPhotos]))
      } catch (error) {
        console.error("Error saving liked photos to localStorage:", error)
      }
    }
  }
  
  // Handle double tap to like
  const handlePhotoTap = (photoId: string, event: React.MouseEvent) => {
    // If we're on a detail view, don't handle taps
    if (selectedPhoto) return
    
    // Check if we have an existing timer for this photo
    if (doubleTapTimer[photoId]) {
      // Clear the timer
      clearTimeout(doubleTapTimer[photoId]!)
      setDoubleTapTimer(prev => ({ ...prev, [photoId]: null }))
      
      // This is a double tap, like the photo if not already liked
      if (!userLikedPhotos.has(photoId)) {
        handleLikePhoto(photoId, event)
      }
    } else {
      // Set a timer for this photo
      const timer = setTimeout(() => {
        // This is a single tap, show the detail view
        setSelectedPhoto(photos.find(p => p.id === photoId) || null)
        setDoubleTapTimer(prev => ({ ...prev, [photoId]: null }))
      }, 300) // 300ms is a good threshold for double tap
      
      setDoubleTapTimer(prev => ({ ...prev, [photoId]: timer }))
    }
    
    // Prevent default behavior
    event.preventDefault()
  }

  // Filter out photos that failed to load
  const validPhotos = photos.filter(photo => !failedImages.has(photo.id))

  if (validPhotos.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No photos yet</h3>
        <p className="text-muted-foreground mt-2">Be the first to upload photos from the wedding!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {validPhotos.map((photo) => (
          <div
            key={photo.id}
            className="aspect-square relative rounded-lg overflow-hidden cursor-pointer group"
            onClick={(e) => handlePhotoTap(photo.id, e)}
          >
            <Image
              src={photo.url || "/placeholder.svg"}
              alt={`Photo by ${photo.name}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => handleImageError(photo.id)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <div className="text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm">
                    <User className="h-3.5 w-3.5" />
                    <p className="font-medium truncate">{photo.name}</p>
                  </div>
                  <button 
                    onClick={(e) => handleLikePhoto(photo.id, e)}
                    className={cn(
                      "flex items-center gap-1 text-sm",
                      userLikedPhotos.has(photo.id) && "cursor-default"
                    )}
                    aria-label={userLikedPhotos.has(photo.id) ? "Already liked" : "Like photo"}
                    disabled={userLikedPhotos.has(photo.id)}
                  >
                    <Heart 
                      className={cn(
                        "h-4 w-4 transition-colors", 
                        userLikedPhotos.has(photo.id) || (likedPhotos[photo.id] || photo.likes) > photo.likes 
                          ? "fill-red-500 text-red-500" 
                          : "text-white"
                      )} 
                    />
                    <span>{likedPhotos[photo.id] !== undefined ? likedPhotos[photo.id] : photo.likes}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-300 mt-1">{formatDate(photo.createdAt)}</p>
              </div>
            </div>
            
            {/* Floating like button */}
            <button 
              onClick={(e) => handleLikePhoto(photo.id, e)}
              className={cn(
                "absolute top-2 right-2 bg-black/40 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                userLikedPhotos.has(photo.id) && "cursor-default"
              )}
              aria-label={userLikedPhotos.has(photo.id) ? "Already liked" : "Like photo"}
              disabled={userLikedPhotos.has(photo.id)}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 transition-colors", 
                  userLikedPhotos.has(photo.id) || (likedPhotos[photo.id] || photo.likes) > photo.likes 
                    ? "fill-red-500 text-red-500" 
                    : "text-white"
                )} 
              />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl w-[90vw]">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-8">
                  <div className="flex items-center gap-2">
                    <DialogTitle>{selectedPhoto.name}</DialogTitle>
                    <div className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      <span>Photographer</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => selectedPhoto && handleLikePhoto(selectedPhoto.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-sm",
                      userLikedPhotos.has(selectedPhoto.id) && "cursor-default"
                    )}
                    aria-label={userLikedPhotos.has(selectedPhoto.id) ? "Already liked" : "Like photo"}
                    disabled={userLikedPhotos.has(selectedPhoto.id)}
                  >
                    <Heart 
                      className={cn(
                        "h-5 w-5 transition-colors", 
                        userLikedPhotos.has(selectedPhoto.id) || (likedPhotos[selectedPhoto.id] || selectedPhoto.likes) > selectedPhoto.likes 
                          ? "fill-red-500 text-red-500" 
                          : "text-muted-foreground"
                      )} 
                    />
                    <span className="text-muted-foreground">
                      {likedPhotos[selectedPhoto.id] !== undefined ? likedPhotos[selectedPhoto.id] : selectedPhoto.likes}
                    </span>
                  </button>
                </div>
                <DialogDescription>{formatDate(selectedPhoto.createdAt)}</DialogDescription>
              </DialogHeader>

              <div className="relative aspect-[4/3] w-full mt-2">
                <Image
                  src={selectedPhoto.url || "/placeholder.svg"}
                  alt={`Photo by ${selectedPhoto.name}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 90vw, 1200px"
                  priority
                  onError={() => {
                    handleImageError(selectedPhoto.id)
                    setSelectedPhoto(null)
                  }}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {failedImages.size > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p>Some images couldn't be displayed. They may have been deleted from storage.</p>
            <p className="text-sm mt-1">Refresh the page to update the gallery.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  )
}

