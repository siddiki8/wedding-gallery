"use client"

import { useRouter, usePathname } from "next/navigation"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { SortAsc, SortDesc, Heart } from "lucide-react"
import type { SortOption } from "@/lib/photos"

interface GallerySorterProps {
  currentSort: SortOption
}

export function GallerySorter({ currentSort }: GallerySorterProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSortChange = (value: string) => {
    // Create a new URL with the selected sort option
    const params = new URLSearchParams()
    if (value !== "recent") {
      params.set("sort", value)
    }
    
    // Navigate to the new URL
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent" className="flex items-center gap-2">
            <SortDesc className="h-4 w-4 mr-1" />
            <span>Newest first</span>
          </SelectItem>
          <SelectItem value="oldest" className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 mr-1" />
            <span>Oldest first</span>
          </SelectItem>
          <SelectItem value="likes" className="flex items-center gap-2">
            <Heart className="h-4 w-4 mr-1" />
            <span>Most liked</span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 