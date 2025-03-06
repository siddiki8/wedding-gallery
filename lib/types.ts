export interface Photo {
  id: string
  url: string
  name: string
  likes: number
  createdAt: Date
}

export interface Email {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface Message {
  id: string
  content: string
  name: string
  createdAt: Date
}

