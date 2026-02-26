export interface TeamPillar {
  title: string
  iconName: string
  colorTheme: 'navy' | 'teal' | 'gold'
  description: string
  subItems: string[]
}

export interface TeamDepartment {
  iconName: string
  name: string
}

export interface RaciRow {
  task: string
  strategy: string
  function: string
  project: string
}

export interface TeamStrength {
  iconName: string
  title: string
  description: string
}

export interface TeamContent {
  pillars: TeamPillar[]
  departments: TeamDepartment[]
  raciMatrix: RaciRow[]
  strengths: TeamStrength[]
  updatedAt?: Date
}
