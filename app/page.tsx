import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Camera, Heart, MessageCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="relative w-40 h-40 mx-auto">
            <Image 
              src="/logo.png" 
              alt="Wedding Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-muted-foreground mt-4 text-lg">Wedding Gallery</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 pt-8">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-serif">Share Your Memories</h2>
            <p className="text-xl text-muted-foreground">Help us capture every special moment from our wedding day</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-muted/50 rounded-lg p-8 flex flex-col items-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-4 rounded-full">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Upload Photos</h3>
              <p className="text-muted-foreground text-center">Share your favorite moments from our special day</p>
              <Button asChild className="mt-4 w-full sm:w-auto">
                <Link href="/upload">
                  Upload Photos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-8 flex flex-col items-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-4 rounded-full">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">View Gallery</h3>
              <p className="text-muted-foreground text-center">
                Browse through all the beautiful memories shared by our guests
              </p>
              <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
                <Link href="/gallery">
                  View Gallery <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-8 flex flex-col items-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-4 rounded-full">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Message Board</h3>
              <p className="text-muted-foreground text-center">
                Read notes and wishes from friends and family
              </p>
              <Button asChild variant="secondary" className="mt-4 w-full sm:w-auto">
                <Link href="/messages">
                  View Messages <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Nickolas & Jasmine — June 28, 2025</p>
        </div>
      </footer>
    </div>
  )
}

