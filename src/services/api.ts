const API_BASE_URL = 'http://172.24.156.131:8000'

export interface Variation {
  id: number
  merchandise_id: number
  quantity: number
  price: number
  variation_text: string
  weight_gram: number
}

export interface Merchandise {
  id: number
  category_id: number
  name: string
  description: string
  image: string
  variations: Variation[]
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  merchandises: Merchandise[]
}

// Fallback данные на случай, если бэкенд не отвечает
const fallbackCategories: Category[] = [
  {
    id: 1,
    name: 'бизнес-ланч',
    slug: 'business-lunch',
    description: '',
    merchandises: []
  },
  {
    id: 2,
    name: 'роллы мини',
    slug: 'mini-rolls',
    description: '',
    merchandises: []
  },
  {
    id: 3,
    name: 'роллы',
    slug: 'rolls',
    description: '',
    merchandises: []
  },
  {
    id: 4,
    name: 'жареные роллы',
    slug: 'fried-rolls',
    description: '',
    merchandises: []
  },
  {
    id: 5,
    name: 'запеченные роллы',
    slug: 'baked-rolls',
    description: '',
    merchandises: []
  },
  {
    id: 6,
    name: 'пицца',
    slug: 'pizza',
    description: '',
    merchandises: []
  },
  {
    id: 7,
    name: 'лапша wok',
    slug: 'wok',
    description: '',
    merchandises: []
  },
  {
    id: 8,
    name: 'сопутствующие товары',
    slug: 'related',
    description: '',
    merchandises: []
  }
]

export const api = {
  async getMerchandise(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/merchandise`, {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!response.ok) {
        console.warn('Backend returned error, using fallback data')
        return fallbackCategories
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch from backend, using fallback data:', error)
      return fallbackCategories
    }
  }
}