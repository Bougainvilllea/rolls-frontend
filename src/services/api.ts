import axios from 'axios'

// Используем относительный путь, чтобы запросы шли через Vite proxy
const API_BASE_URL = '' // Пустая строка - запросы будут на тот же хост

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

export interface OrderItemRequest {
  variation_id: number
  quantity: number
}

export interface CreateOrderRequest {
  items: OrderItemRequest[]
}

export interface OrderResponse {
  id: number
  user_name: string
  user_email: string
  user_phone_number: string
  user_address: string
  created_at: string
  items: OrderItemResponse[]
  status: string
}

export interface OrderItemResponse {
  id: number
  variation_id: number
  quantity: number
  price_at_time: string
}

export interface MessageResponse {
  message: string
}

export interface RegisterRequest {
  name: string
  email: string
  phone_number: string
  address: string
  password: string
}

export interface LoginRequest {
  login: string
  password: string
}

export interface UserResponse {
  id: string
  name: string
  email: string
  phone_number: string
  address: string
  role: string
  is_active: boolean
  created_at: string
}

// Создаем экземпляр axios с базовыми настройками
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Важно для отправки cookies
})

// Интерцептор для логирования запросов
axiosInstance.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
  // Добавляем /api префикс для всех запросов, кроме случаев когда он уже есть
  if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
    config.url = `/api${config.url}`
  }
  return config
})

// Интерцептор для обработки ошибок
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API] Response:`, response.status)
    return response
  },
  (error) => {
    console.error(`[API] Error:`, error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export const api = {
  // ========== Товары ==========
  async getMerchandise(): Promise<Category[]> {
    try {
      const response = await axiosInstance.get('/merchandise')
      
      if (response.data && Array.isArray(response.data)) {
        const categoriesWithItems = response.data.filter(cat => 
          cat.merchandises && cat.merchandises.length > 0
        )
        return categoriesWithItems.length > 0 ? categoriesWithItems : response.data
      } else {
        throw new Error('Неверный формат данных от бэкенда')
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error)
      throw error
    }
  },

  // ========== Авторизация ==========
  async register(data: RegisterRequest): Promise<MessageResponse> {
    const response = await axiosInstance.post('/auth/register', data)
    return response.data
  },

  async login(login: string, password: string): Promise<MessageResponse> {
    const response = await axiosInstance.post('/auth/login', { login, password })
    return response.data
  },

  async verifyEmail(token: string): Promise<MessageResponse> {
    const response = await axiosInstance.get(`/auth/verify-email?token=${token}`)
    return response.data
  },

  async logout(): Promise<MessageResponse> {
    const response = await axiosInstance.post('/auth/logout')
    return response.data
  },

  async getCurrentUser(): Promise<UserResponse> {
    const response = await axiosInstance.get('/users/me')
    return response.data
  },

  async updateMe(data: { name?: string | null; phone_number?: string | null; address?: string | null }): Promise<UserResponse> {
    const response = await axiosInstance.patch('/users/me', data)
    return response.data
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<MessageResponse> {
    const response = await axiosInstance.post('/users/me/password/change', {
      old_password: oldPassword,
      new_password: newPassword
    })
    return response.data
  },

  async requestPasswordReset(email: string): Promise<MessageResponse> {
    const response = await axiosInstance.post('/users/me/reset-password', { email })
    return response.data
  },

  async resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
    const response = await axiosInstance.post('/users/me/reset-password/confirm', {
      token,
      new_password: newPassword
    })
    return response.data
  },

  // ========== Заказы ==========
  async createOrder(items: OrderItemRequest[]): Promise<OrderResponse> {
    const response = await axiosInstance.post('/orders', { items })
    return response.data
  },

  async getMyOrders(): Promise<OrderResponse[]> {
    const response = await axiosInstance.get('/orders')
    return response.data.orders || []
  },

  async getOrder(orderId: number): Promise<OrderResponse> {
    const response = await axiosInstance.get(`/orders/${orderId}`)
    return response.data
  },

  // Метод для проверки статуса соединения
  async checkConnection(): Promise<boolean> {
    try {
      await axiosInstance.get('/merchandise', { timeout: 3000 })
      return true
    } catch {
      return false
    }
  }
}