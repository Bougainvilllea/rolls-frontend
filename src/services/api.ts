import axios from 'axios'

const API_BASE_URL = 'http://192.168.196.169:8000'

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
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

export const api = {
  async getMerchandise(): Promise<Category[]> {
    try {
      console.log('Загружаем данные с бэкенда...')
      const response = await axiosInstance.get('/merchandise')
      
      console.log('Получены данные от бэкенда:', response.data)
      
      // Бэкенд возвращает массив категорий
      if (response.data && Array.isArray(response.data)) {
        // Фильтруем категории, у которых есть товары (опционально)
        const categoriesWithItems = response.data.filter(cat => 
          cat.merchandises && cat.merchandises.length > 0
        )
        
        console.log(`Загружено ${response.data.length} категорий, из них с товарами: ${categoriesWithItems.length}`)
        
        // Если есть категории с товарами, возвращаем их, иначе все категории
        return categoriesWithItems.length > 0 ? categoriesWithItems : response.data
      } else {
        throw new Error('Неверный формат данных от бэкенда')
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных с бэкенда:', error)
      throw error // Пробрасываем ошибку дальше, чтобы компонент знал о проблеме
    }
  },

  async getMerchandiseByCategory(categoryId: number): Promise<Merchandise[]> {
    try {
      const response = await axiosInstance.get(`/merchandise?category_id=${categoryId}`)
      return response.data
    } catch (error) {
      console.error('Ошибка при загрузке товаров по категории:', error)
      throw error
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await axiosInstance.get('/categories')
      return response.data
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error)
      throw error
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
  }
}