export interface Branch {
  title: string
  address: string
  latitude?: number
  longitude?: number
}

export interface GalleryImage {
  id: string
  url: string
}

export interface SellerProfile {
  id: string
  userId: number
  companyName: string | null
  aboutCompany: string | null
  phones: string[]
  branches: Branch[]
  gallery: GalleryImage[]
  createdAt: string
  updatedAt: string
}

export interface UpdateSellerProfilePayload {
  companyName?: string
  aboutCompany?: string
  phones?: string[]
  branches?: Branch[]
}

export interface SellerOffer {
  id: string
  title: string
  slug?: string | null
  description: string
  images?: string[]
  price?: number | null
  oldPrice?: number | null
  inStock: boolean
  createdAt: string
}
