<script setup lang="ts">
import { ref, onUnmounted, watch, onMounted } from 'vue'

// Components
import Header from './components/layout/Header.vue'
import AnchorBar from './components/layout/AnchorBar.vue'
import MenuOverlay from './components/layout/MenuOverlay.vue'
import CustomCursor from './components/common/CustomCursor.vue'
import AuthModal from './components/modals/AuthModal.vue'
import ForgotPasswordModal from './components/modals/ForgotPasswordModal.vue'
import ProfileModal from './components/modals/ProfileModal.vue'
import CartModal from './components/modals/CartModal.vue'
import SearchModal from './components/modals/SearchModal.vue'
import FilterModal from './components/modals/FilterModal.vue'
import CategorySection from './components/merchandise/CategorySection.vue'

// Services
import { api, type Category } from './services/api'

// State
const isMenuOpen = ref(false)
const cursorX = ref(0)
const cursorY = ref(0)
const isOnDarkOverlay = ref(false)
const showAuthPage = ref(false)
const showProfilePage = ref(false)
const showCartPage = ref(false)
const showForgotPasswordPage = ref(false)
const showSearchPage = ref(false)
const showFilterPage = ref(false)
const authMode = ref<'login' | 'register'>('login')

// User data
const currentUser = ref<any>(null)

// Forms
const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const forgotPasswordEmail = ref('')
const searchQuery = ref('')

// Filters
const availableIngredients = [
  'Лосось', 'Угорь', 'Креветка', 'Огурец', 'Авокадо',
  'Рис', 'Нори', 'Сыр', 'Икра', 'Тунец'
]
const selectedIngredients = ref<string[]>([])

// Categories data from backend
const categories = ref<Category[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Cart
interface CartItem {
  merchandiseId: number
  variationId: number
  quantity: number
  merchandise: any
  variation: any
}
const cartItems = ref<CartItem[]>([])
const cartTotal = ref(0)

// Anchor bar categories (for navigation)
const anchorCategories = ref<{ id: string; name: string }[]>([])
const activeCategory = ref<string>('')
const isAnchorBarFixed = ref(false)

// Auth functions
const saveSession = (user: any) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } else {
    localStorage.removeItem('currentUser')
  }
}

const loadSession = () => {
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
  }
}

const clearSession = () => {
  localStorage.removeItem('currentUser')
  currentUser.value = null
}

const handleLogin = () => {
  if (loginForm.value.username && loginForm.value.password) {
    currentUser.value = {
      name: loginForm.value.username,
      username: loginForm.value.username,
      phone: '+7 (XXX) XXX-XX-XX',
      email: `${loginForm.value.username}@example.com`,
      registeredAt: new Date().toLocaleDateString('ru-RU')
    }
    saveSession(currentUser.value)
    closeAuthPage()
    showProfilePage.value = true
  } else {
    alert('Пожалуйста, заполните все поля')
  }
}

const handleRegister = () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    alert('Пароли не совпадают')
    return
  }
  
  if (registerForm.value.password.length < 6) {
    alert('Пароль должен содержать минимум 6 символов')
    return
  }
  
  if (registerForm.value.name && registerForm.value.phone && registerForm.value.email && registerForm.value.password) {
    currentUser.value = {
      name: registerForm.value.name,
      username: registerForm.value.name.toLowerCase().replace(/\s/g, ''),
      phone: registerForm.value.phone,
      email: registerForm.value.email,
      registeredAt: new Date().toLocaleDateString('ru-RU')
    }
    saveSession(currentUser.value)
    closeAuthPage()
    showProfilePage.value = true
  } else {
    alert('Пожалуйста, заполните все поля')
  }
}

const handleForgotPassword = () => {
  if (forgotPasswordEmail.value) {
    alert(`Инструкции по восстановлению пароля отправлены на ${forgotPasswordEmail.value}`)
    closeForgotPassword()
  } else {
    alert('Пожалуйста, введите email')
  }
}

const logout = () => {
  clearSession()
  currentUser.value = null
  showProfilePage.value = false
  alert('Вы вышли из аккаунта')
}

// UI functions
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (!isMenuOpen.value) {
    document.body.style.cursor = ''
    isOnDarkOverlay.value = false
  }
}

const closeMenu = () => {
  if (isMenuOpen.value) {
    isMenuOpen.value = false
    document.body.style.cursor = ''
    isOnDarkOverlay.value = false
  }
}

const openAuthPage = () => {
  showAuthPage.value = true
  closeMenu()
}

const closeAuthPage = () => {
  showAuthPage.value = false
  showForgotPasswordPage.value = false
  authMode.value = 'login'
  document.body.style.cursor = ''
  isOnDarkOverlay.value = false
  loginForm.value = { username: '', password: '' }
  registerForm.value = { name: '', phone: '', email: '', password: '', confirmPassword: '' }
  forgotPasswordEmail.value = ''
}

const openProfile = () => {
  if (currentUser.value) {
    showProfilePage.value = true
  } else {
    openAuthPage()
  }
  closeMenu()
}

const closeProfilePage = () => {
  showProfilePage.value = false
  document.body.style.cursor = ''
  isOnDarkOverlay.value = false
}

const openCart = () => {
  showCartPage.value = true
  closeMenu()
}

const closeCartPage = () => {
  showCartPage.value = false
  document.body.style.cursor = ''
  isOnDarkOverlay.value = false
}

const openSearch = () => {
  showSearchPage.value = true
  closeMenu()
}

const closeSearchPage = () => {
  showSearchPage.value = false
  searchQuery.value = ''
  document.body.style.cursor = ''
  isOnDarkOverlay.value = false
}

const openFilter = () => {
  showFilterPage.value = true
  closeMenu()
}

const closeFilterPage = () => {
  showFilterPage.value = false
  document.body.style.cursor = ''
  isOnDarkOverlay.value = false
}

const openForgotPassword = () => {
  showForgotPasswordPage.value = true
}

const closeForgotPassword = () => {
  showForgotPasswordPage.value = false
  forgotPasswordEmail.value = ''
}

const switchToLogin = () => {
  authMode.value = 'login'
}

const switchToRegister = () => {
  authMode.value = 'register'
}

const toggleIngredient = (ingredient: string) => {
  const index = selectedIngredients.value.indexOf(ingredient)
  if (index === -1) {
    selectedIngredients.value.push(ingredient)
  } else {
    selectedIngredients.value.splice(index, 1)
  }
}

const resetFilters = () => {
  selectedIngredients.value = []
}

const applyFilters = () => {
  closeFilterPage()
}

// Cart functions
const addToCart = (merchandiseId: number, variationId: number, quantityChange: number) => {
  const existingItem = cartItems.value.find(
    item => item.merchandiseId === merchandiseId && item.variationId === variationId
  )
  
  if (existingItem) {
    existingItem.quantity += quantityChange
    if (existingItem.quantity <= 0) {
      cartItems.value = cartItems.value.filter(
        item => !(item.merchandiseId === merchandiseId && item.variationId === variationId)
      )
    }
  } else if (quantityChange > 0) {
    for (const category of categories.value) {
      const merch = category.merchandises.find(m => m.id === merchandiseId)
      if (merch) {
        const variation = merch.variations.find(v => v.id === variationId)
        if (variation) {
          cartItems.value.push({
            merchandiseId,
            variationId,
            quantity: quantityChange,
            merchandise: merch,
            variation
          })
          break
        }
      }
    }
  }
  
  updateCartTotal()
}

const removeFromCart = (merchandiseId: number, variationId: number) => {
  cartItems.value = cartItems.value.filter(
    item => !(item.merchandiseId === merchandiseId && item.variationId === variationId)
  )
  updateCartTotal()
}

const updateCartTotal = () => {
  cartTotal.value = cartItems.value.reduce(
    (total, item) => total + (item.variation?.price || 0) * item.quantity,
    0
  )
}

// Navigation
const scrollToCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  const element = document.getElementById(categoryId)
  if (element) {
    const headerHeight = 80
    const anchorBarHeight = 70
    const offset = headerHeight + anchorBarHeight + 20
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

// Load data from backend
const loadData = async () => {
  isLoading.value = true
  error.value = null
  try {
    const data = await api.getMerchandise()
    categories.value = data
    
    // Update anchor categories
    anchorCategories.value = categories.value.map(cat => ({
      id: cat.slug,
      name: cat.name.toUpperCase()
    }))
    
    if (anchorCategories.value.length > 0) {
      activeCategory.value = anchorCategories.value[0].id
    }
  } catch (err) {
    console.error('Failed to load merchandise:', err)
    error.value = 'Не удалось загрузить товары. Используются тестовые данные.'
    // Use fallback anchor categories even if data failed
    anchorCategories.value = [
      { id: 'business-lunch', name: 'БИЗНЕС-ЛАНЧ' },
      { id: 'mini-rolls', name: 'РОЛЛЫ МИНИ' },
      { id: 'rolls', name: 'РОЛЛЫ' },
      { id: 'fried-rolls', name: 'ЖАРЕНЫЕ РОЛЛЫ' },
      { id: 'baked-rolls', name: 'ЗАПЕЧЕННЫЕ РОЛЛЫ' },
      { id: 'pizza', name: 'ПИЦЦА' },
      { id: 'wok', name: 'ЛАПША WOK' },
      { id: 'related', name: 'СОПУТСТВУЮЩИЕ ТОВАРЫ' }
    ]
    activeCategory.value = anchorCategories.value[0].id
  } finally {
    isLoading.value = false
  }
}

// Scroll handler for anchor bar
const handleScroll = () => {
  const anchorBar = document.querySelector('.anchor-bar')
  if (anchorBar) {
    const rect = anchorBar.getBoundingClientRect()
    isAnchorBarFixed.value = rect.top <= 0 && window.scrollY > 100
  }
  
  const scrollPosition = window.scrollY + 150
  let currentSection = anchorCategories.value[0]?.id || ''
  
  for (const category of anchorCategories.value) {
    const element = document.getElementById(category.id)
    if (element) {
      const offsetTop = element.offsetTop
      if (scrollPosition >= offsetTop) {
        currentSection = category.id
      }
    }
  }
  
  if (currentSection && currentSection !== activeCategory.value) {
    activeCategory.value = currentSection
  }
}

// Mouse move for custom cursor
const handleMouseMove = (e: MouseEvent) => {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
  
  let isOnDark = false
  
  if (isMenuOpen.value) {
    let menuWidth = 25
    if (window.innerWidth <= 768) {
      menuWidth = 70
    } else if (window.innerWidth <= 480) {
      menuWidth = 85
    }
    isOnDark = cursorX.value > (window.innerWidth * menuWidth / 100)
  } 
  else if (showSearchPage.value) {
    const modalElement = document.querySelector('.search-modal')
    if (modalElement) {
      const rect = modalElement.getBoundingClientRect()
      const isInsideModal = cursorX.value >= rect.left && 
                           cursorX.value <= rect.right && 
                           cursorY.value >= rect.top && 
                           cursorY.value <= rect.bottom
      isOnDark = !isInsideModal
    }
  }
  else if (showFilterPage.value) {
    const modalElement = document.querySelector('.filter-modal')
    if (modalElement) {
      const rect = modalElement.getBoundingClientRect()
      const isInsideModal = cursorX.value >= rect.left && 
                           cursorX.value <= rect.right && 
                           cursorY.value >= rect.top && 
                           cursorY.value <= rect.bottom
      isOnDark = !isInsideModal
    }
  }
  else if (showAuthPage.value && !showForgotPasswordPage.value) {
    const modalElement = document.querySelector('.auth-modal')
    if (modalElement) {
      const rect = modalElement.getBoundingClientRect()
      const isInsideModal = cursorX.value >= rect.left && 
                           cursorX.value <= rect.right && 
                           cursorY.value >= rect.top && 
                           cursorY.value <= rect.bottom
      isOnDark = !isInsideModal
    }
  }
  else if (showForgotPasswordPage.value) {
    const modalElement = document.querySelector('.forgot-password-modal')
    if (modalElement) {
      const rect = modalElement.getBoundingClientRect()
      const isInsideModal = cursorX.value >= rect.left && 
                           cursorX.value <= rect.right && 
                           cursorY.value >= rect.top && 
                           cursorY.value <= rect.bottom
      isOnDark = !isInsideModal
    }
  }
  else if (showProfilePage.value) {
    const modalElement = document.querySelector('.profile-modal')
    if (modalElement) {
      const rect = modalElement.getBoundingClientRect()
      const isInsideModal = cursorX.value >= rect.left && 
                           cursorX.value <= rect.right && 
                           cursorY.value >= rect.top && 
                           cursorY.value <= rect.bottom
      isOnDark = !isInsideModal
    }
  }
  else if (showCartPage.value) {
    const modalElement = document.querySelector('.cart-modal')
    if (modalElement) {
      const rect = modalElement.getBoundingClientRect()
      const isInsideModal = cursorX.value >= rect.left && 
                           cursorX.value <= rect.right && 
                           cursorY.value >= rect.top && 
                           cursorY.value <= rect.bottom
      isOnDark = !isInsideModal
    }
  }
  
  if (isOnDark && !isOnDarkOverlay.value) {
    isOnDarkOverlay.value = true
    document.body.style.cursor = 'none'
  } else if (!isOnDark && isOnDarkOverlay.value) {
    isOnDarkOverlay.value = false
    document.body.style.cursor = ''
  }
}

// Lifecycle
onMounted(() => {
  loadSession()
  loadData()
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.cursor = ''
  document.removeEventListener('mousemove', handleMouseMove)
})

// Watch for modal windows
watch([isMenuOpen, showAuthPage, showForgotPasswordPage, showProfilePage, showCartPage, showSearchPage, showFilterPage], 
  ([menuOpen, authOpen, forgotOpen, profileOpen, cartOpen, searchOpen, filterOpen]) => {
  if (menuOpen || authOpen || forgotOpen || profileOpen || cartOpen || searchOpen || filterOpen) {
    document.addEventListener('mousemove', handleMouseMove)
  } else {
    document.removeEventListener('mousemove', handleMouseMove)
    document.body.style.cursor = ''
    isOnDarkOverlay.value = false
  }
})
</script>

<template>
  <div class="background-circles">
    <div class="circle circle-1"></div>
    <div class="circle circle-2"></div>
    <div class="circle circle-3"></div>
    <div class="circle circle-4"></div>
    <div class="circle circle-5"></div>
  
    <Header 
      :isMenuOpen="isMenuOpen"
      @toggleMenu="toggleMenu"
      @openCart="openCart"
      @openProfile="openProfile"
    />
  
    <MenuOverlay 
      :isOpen="isMenuOpen"
      :isLoggedIn="!!currentUser"
      @close="closeMenu"
      @login="openAuthPage"
    />
  
    <!-- Anchor bar - всегда показываем, даже если данные еще грузятся -->
    <AnchorBar 
      :categories="anchorCategories"
      :activeCategory="activeCategory"
      :hasActiveFilters="selectedIngredients.length > 0"
      :isSearchOpen="showSearchPage"
      :isAnchorBarFixed="isAnchorBarFixed"
      @openFilter="openFilter"
      @openSearch="openSearch"
      @scrollTo="scrollToCategory"
    />
  
    <div class="app">
      <div class="header-wrapper">
        <div class="title-container">
          <img src="/src/public/ram.png" alt="Рамка" class="frame-image" />
          <div class="blur-circle"></div>
          <img src="/src/public/hap.png" alt="Hap" class="hap-image" />
          <h1>Суши<br>Лавка</h1>
          <div class="sushi-tagline">
            пожалуй,<br>самые большие<br>роллы
          </div>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="loader"></div>
        <p>Загрузка меню...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadData" class="retry-btn">Повторить попытку</button>
      </div>
      
      <!-- Categories sections -->
      <div v-else class="sections-container">
        <CategorySection 
          v-for="category in categories" 
          :key="category.id"
          :category="category"
          @addToCart="addToCart"
          @removeFromCart="removeFromCart"
        />
      </div>
    </div>
  
    <!-- Modals -->
    <AuthModal 
      :isOpen="showAuthPage && !showForgotPasswordPage"
      :mode="authMode"
      :loginForm="loginForm"
      :registerForm="registerForm"
      @close="closeAuthPage"
      @login="handleLogin"
      @register="handleRegister"
      @forgotPassword="openForgotPassword"
      @switchToLogin="switchToLogin"
      @switchToRegister="switchToRegister"
      @update:loginForm="(form) => loginForm = form"
      @update:registerForm="(form) => registerForm = form"
    />
  
    <ForgotPasswordModal 
      :isOpen="showForgotPasswordPage"
      :email="forgotPasswordEmail"
      @close="closeForgotPassword"
      @submit="handleForgotPassword"
      @update:email="(email) => forgotPasswordEmail = email"
    />
  
    <ProfileModal 
      :isOpen="showProfilePage"
      :user="currentUser"
      :orders="[]"
      @close="closeProfilePage"
      @logout="logout"
    />
  
    <CartModal 
      :isOpen="showCartPage"
      :items="cartItems.map(item => ({
        id: item.merchandiseId,
        name: item.merchandise?.name || '',
        price: item.variation?.price || 0,
        quantity: item.quantity
      }))"
      :total="cartTotal"
      @close="closeCartPage"
      @checkout="() => {}"
      @increment="() => {}"
      @decrement="() => {}"
      @remove="() => {}"
    />
  
    <SearchModal 
      :isOpen="showSearchPage"
      :query="searchQuery"
      @close="closeSearchPage"
      @search="() => {}"
      @update:query="(query) => searchQuery = query"
    />
  
    <FilterModal 
      :isOpen="showFilterPage"
      :ingredients="availableIngredients"
      :selectedIngredients="selectedIngredients"
      @close="closeFilterPage"
      @apply="applyFilters"
      @reset="resetFilters"
      @toggleIngredient="toggleIngredient"
    />
  
    <CustomCursor 
      :visible="isOnDarkOverlay"
      :x="cursorX"
      :y="cursorY"
    />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;         
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  background: white;
  overflow-x: hidden;   
  cursor: auto;
}

.background-circles {
  position: fixed;      
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;       
  background: white;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: #E9544E;
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 500px;
  height: 500px;
  background: #FFBF9C;
  bottom: -150px;
  right: -150px;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: #FFBF9C;
  top: 50%;
  left: 20%;
}

.circle-4 {
  width: 350px;
  height: 350px;
  background: #ff8c94;
  top: 20%;
  right: 10%;
}

.circle-5 {
  width: 250px;
  height: 250px;
  background: #ff8c94;
  bottom: 30%;
  left: 10%;
}

.app {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 100px;
  padding-bottom: 100px;
}

.header-wrapper {
  display: flex;
  justify-content: center; 
  margin-bottom: 50px;
}

.title-container {
  position: relative;
  display: inline-block;
  text-align: center;
  min-height: 200px;
}

.frame-image {
  position: absolute;
  top: -250px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  height: auto;
  max-width: 1600px;
  z-index: 1;
  pointer-events: none;
}

.blur-circle {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 550px;
  height: 550px;
  background: #FFBF9C;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.9;
  z-index: 2;
  pointer-events: none;
}

.hap-image {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: auto;
  height: auto;
  max-width: 600px;
  z-index: 3;
  pointer-events: none;
}

h1 {
  font-family: 'ChinaCyr', 'Arial', sans-serif; 
  color: #333;
  font-size: 96px;
  margin-bottom: 30px;
  line-height: 0.9;
  letter-spacing: 2px; 
  font-weight: normal; 
  text-align: center;
  position: relative;
  z-index: 4;
  margin-top: -220px;
}

.sushi-tagline {
  position: absolute;
  bottom: 180px;
  right: -155px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 20px;
  font-weight: 1000;
  color: #E9544E;
  text-align: left;
  line-height: 1.3;
  white-space: nowrap;
  z-index: 4;
}

/* Sections container */
.sections-container {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loader {
  width: 50px;
  height: 50px;
  border: 3px solid #e0e0e0;
  border-top-color: #E9544E;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-family: 'Courier New', Courier, monospace;
  color: #666;
}

/* Error state */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.error-state p {
  font-family: 'Courier New', Courier, monospace;
  color: #E9544E;
  font-size: 18px;
}

.retry-btn {
  background: #E9544E;
  color: white;
  border: none;
  padding: 12px 30px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #d43f39;
  transform: scale(1.02);
}

/* Responsive */
@media (max-width: 768px) {
  .app {
    padding-top: 80px;
  }
  
  .frame-image {
    max-width: 600px;
  }
  
  .blur-circle {
    width: 350px;
    height: 350px;
    top: 120px;
  }
  
  .hap-image {
    max-width: 350px;
  }
  
  h1 {
    font-size: 72px;
  }
  
  .sushi-tagline {
    font-size: 16px;
    right: -100px;
    bottom: -25px;
  }
}

@media (max-width: 480px) {
  .frame-image {
    max-width: 350px;
    top: -50px;
  }
  
  .blur-circle {
    width: 220px;
    height: 220px;
    top: 80px;
  }
  
  .hap-image {
    max-width: 220px;
  }
  
  h1 {
    font-size: 48px;
  }
  
  .sushi-tagline {
    font-size: 12px;
    right: -50px;
    bottom: -15px;
  }
}

@media (max-width: 950px) {
  .sushi-tagline {
    position: static;
    margin-top: 10px;
    text-align: center;
    white-space: normal;
  }
  
  .title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 600px) {
  h1 {
    font-size: 60px;
  }
}
</style>