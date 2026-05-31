import axios from 'axios'
import localData from 'C:/Users/lizab/rolls-frontend/src/data/merchandise.json'

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

// Создаем экземпляр axios с базовыми настройками
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Уменьшаем таймаут для быстрого переключения на локальные данные
  headers: {
    'Content-Type': 'application/json',
  }
})

// Флаг для отслеживания, используем ли локальные данные
let useLocalData = false

export const api = {
  async getMerchandise(): Promise<Category[]> {
    // Если уже используем локальные данные, сразу возвращаем их
    if (useLocalData) {
      console.log('Используем локальные данные (режим оффлайн)')
      return localData.categories
    }

    try {
      console.log('Пытаемся загрузить данные с бэкенда...')
      const response = await axiosInstance.get('/merchandise')
      
      console.log('Получены данные от бэкенда:', response.data)
      
      // Бэкенд возвращает массив категорий
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Фильтруем категории, у которых есть товары (опционально)
        const categoriesWithItems = response.data.filter(cat => 
          cat.merchandises && cat.merchandises.length > 0
        )
        
        console.log(`Загружено ${response.data.length} категорий, из них с товарами: ${categoriesWithItems.length}`)
        
        // Если есть категории с товарами, возвращаем их, иначе все категории
        return categoriesWithItems.length > 0 ? categoriesWithItems : response.data
      } else {
        console.warn('Неверный формат данных от бэкенда, используем локальные данные')
        useLocalData = true
        return localData.categories
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных с бэкенда:', error)
      console.log('Переключаемся на локальные данные')
      useLocalData = true
      return localData.categories
    }
  },

  async getMerchandiseByCategory(categoryId: number): Promise<Merchandise[]> {
    if (useLocalData) {
      const category = localData.categories.find(cat => cat.id === categoryId)
      return category?.merchandises || []
    }

    try {
      const response = await axiosInstance.get(`/merchandise?category_id=${categoryId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch merchandise by category:', error)
      const category = localData.categories.find(cat => cat.id === categoryId)
      return category?.merchandises || []
    }
  },

  async getCategories(): Promise<Category[]> {
    if (useLocalData) {
      return localData.categories
    }

    try {
      const response = await axiosInstance.get('/categories')
      return response.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      return localData.categories
    }
  },

  // Метод для проверки статуса соединения с бэкендом
  async checkConnection(): Promise<boolean> {
    try {
      await axiosInstance.get('/merchandise', { timeout: 3000 })
      return true
    } catch {
      return false
    }
  },

  // Метод для принудительного переключения на локальные данные
  switchToLocalData(): void {
    useLocalData = true
    console.log('Принудительно переключены на локальные данные')
  },

  // Метод для попытки восстановления соединения с бэкендом
  async tryRestoreConnection(): Promise<boolean> {
    const isConnected = await this.checkConnection()
    if (isConnected) {
      useLocalData = false
      console.log('Соединение с бэкендом восстановлено')
    }
    return isConnected
  }
}

