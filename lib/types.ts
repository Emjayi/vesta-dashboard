export interface User {
  id: number
  name: string
  username: string
  email: string
  address: {
    street: string
    suite: string
    city: string
    zipcode: string
    geo: {
      lat: string
      lng: string
    }
  }
  phone: string
  website: string
  company: {
    name: string
    catchPhrase: string
    bs: string
  }
}

export interface Task {
  id: number
  userId: number
  title: string
  completed: boolean
  user?: User
}

export interface TaskFilters {
  userId?: number
  userIds?: number[] // New field for multi-selection
  status?: "all" | "completed" | "pending"
  search?: string
}

export interface CreateTaskData {
  title: string
  userId: number
  completed: boolean
}

export interface UpdateTaskData {
  id: number
  title?: string
  userId?: number
  completed?: boolean
}
