export interface WorkScheduleDay {
  /** 0 = Monday, 6 = Sunday */
  day: number
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
}

export interface PriceTariff {
  price: number
  priceType: string
}

export interface AttributeEntry {
  key: string
  value: string
}

export interface Offer {
  id: string
  title: string
  slug?: string | null
  description: string
  images?: string[]
  price?: number | null
  oldPrice?: number | null
  prices?: PriceTariff[]
  inStock: boolean
  rating?: number
  reviewCount?: number
  salesCount?: number
  brandId?: string | null
  attributes?: AttributeEntry[]
  workSchedule?: WorkScheduleDay[]
  features?: string[]
  rules?: string[]
  category_id?: string | null
  branchAddress?: string | null
  author?: { id: number; email: string }
  createdAt: string
  updatedAt: string
}

export interface CreateOffer {
  title: string
  description: string
  images?: string[]
  prices?: PriceTariff[]
  price?: number
  oldPrice?: number
  inStock?: boolean
  categoryId?: string
  branchAddress?: string
  workSchedule?: WorkScheduleDay[]
  features?: string[]
  rules?: string[]
  attributes?: AttributeEntry[]
}

export type UpdateOffer = Partial<CreateOffer>
