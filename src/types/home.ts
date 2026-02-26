export interface BrandValue {
  label: string
  iconName: string
  description: string
}

export interface ThreeNoWorry {
  title: string
  iconName: string
  description: string
}

export interface HomeStat {
  value: string
  label: string
  iconName: string
}

export interface HomeContent {
  brandValues: BrandValue[]
  threeNoWorries: ThreeNoWorry[]
  stats: HomeStat[]
  updatedAt?: Date
}
