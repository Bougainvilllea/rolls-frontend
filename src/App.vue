<script setup lang="ts">
import { ref, onUnmounted, watch, onMounted } from 'vue'
import { RouterView } from 'vue-router'

const isMenuOpen = ref(false)
const cursorX = ref(0)
const cursorY = ref(0)
const isOnDarkOverlay = ref(false)
const showAuthPage = ref(false)
const showProfilePage = ref(false)
const showCartPage = ref(false)
const authMode = ref<'login' | 'register'>('login')

// Данные пользователя (временное хранилище)
const currentUser = ref<any>(null)

// Формы
const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  name: '',
  phone: '',
  email: ''
})

// Заказы пользователя (пустая заглушка)
const userOrders = ref<any[]>([])

// Корзина (для будущих товаров)
const cartItems = ref<any[]>([])
const cartTotal = ref(0)

// Функции для работы с localStorage
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
  authMode.value = 'login'
  document.body.style.cursor = ''
  isOnDarkOverlay.value = false
  // Очищаем формы
  loginForm.value = { username: '', password: '' }
  registerForm.value = { name: '', phone: '', email: '' }
}

const switchToLogin = () => {
  authMode.value = 'login'
}

const switchToRegister = () => {
  authMode.value = 'register'
}

const handleLogin = () => {
  if (loginForm.value.username && loginForm.value.password) {
    // Имитация входа - создаем данные пользователя
    currentUser.value = {
      name: loginForm.value.username,
      username: loginForm.value.username,
      phone: '+7 (XXX) XXX-XX-XX',
      email: `${loginForm.value.username}@example.com`,
      registeredAt: new Date().toLocaleDateString('ru-RU')
    }
    console.log('Вход выполнен:', currentUser.value)
    saveSession(currentUser.value)
    closeAuthPage()
    showProfilePage.value = true
  } else {
    alert('Пожалуйста, заполните все поля')
  }
}

const handleRegister = () => {
  if (registerForm.value.name && registerForm.value.phone && registerForm.value.email) {
    // Имитация регистрации - сохраняем введенные данные
    currentUser.value = {
      name: registerForm.value.name,
      username: registerForm.value.name.toLowerCase().replace(/\s/g, ''),
      phone: registerForm.value.phone,
      email: registerForm.value.email,
      registeredAt: new Date().toLocaleDateString('ru-RU')
    }
    console.log('Регистрация:', currentUser.value)
    saveSession(currentUser.value)
    closeAuthPage()
    showProfilePage.value = true
  } else {
    alert('Пожалуйста, заполните все поля')
  }
}

const openProfile = () => {
  if (currentUser.value) {
    showProfilePage.value = true
  } else {
    openAuthPage()
  }
}

const closeProfilePage = () => {
  showProfilePage.value = false
  document.body.style.cursor = ''
  isOnDarkOverlay.value = false
}

const logout = () => {
  clearSession()
  currentUser.value = null
  showProfilePage.value = false
  alert('Вы вышли из аккаунта')
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

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    'Доставлен': 'delivered',
    'В обработке': 'in-progress',
    'Отменен': 'cancelled'
  }
  return statusMap[status] || ''
}

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
  else if (showAuthPage.value) {
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

// Следим за открытием модальных окон
watch([isMenuOpen, showAuthPage, showProfilePage, showCartPage], ([menuOpen, authOpen, profileOpen, cartOpen]) => {
  if (menuOpen || authOpen || profileOpen || cartOpen) {
    document.addEventListener('mousemove', handleMouseMove)
  } else {
    document.removeEventListener('mousemove', handleMouseMove)
    document.body.style.cursor = ''
    isOnDarkOverlay.value = false
  }
})

// Загружаем сессию при монтировании компонента
onMounted(() => {
  loadSession()
})

onUnmounted(() => {
  document.body.style.cursor = ''
  document.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div class="background-circles">
    <div class="circle circle-1"></div>
    <div class="circle circle-2"></div>
    <div class="circle circle-3"></div>
    <div class="circle circle-4"></div>
    <div class="circle circle-5"></div>
  
    <header class="white-header">
      <div class="header-container">
        <div class="left-section">
          <div class="logo-section">
            <img src="/src/public/logo.png" alt="Логотип" class="logo" />
          </div>
          
          <div class="contact-section">
            <div class="address">Кемерово, Тухачевского, 22Б</div>
            <div class="phone">67-16-06</div>
          </div>
        </div>
        
        <div class="icons-section">
          <img 
            :src="isMenuOpen ? '/src/public/bur2.png' : '/src/public/bur.png'" 
            alt="Bur" 
            class="icon-img" 
            @click="toggleMenu"
          />
          <img 
            src="/src/public/kor.png" 
            alt="Kor" 
            class="icon-img" 
            @click="openCart"
          />
          <img 
            src="/src/public/prof.png" 
            alt="Prof" 
            class="icon-img" 
            @click="openProfile"
          />
        </div>
      </div>
    </header>
  
    <div v-if="isMenuOpen" class="menu-overlay">
      <div class="side-menu">
        <div class="menu-content">
          <div class="menu-item">Главная</div>
          <div class="menu-item">Меню</div>
          <div class="menu-item">Акции</div>
          <div class="menu-item">Контакты</div>
          <div class="menu-item">О нас</div>
        </div>
      </div>
      
      <div class="dark-overlay" @click="closeMenu"></div>
      
      <div 
        v-if="isOnDarkOverlay" 
        class="custom-cursor"
        :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
      >
        <img 
          src="/src/public/krest.png" 
          alt="cursor" 
          class="cursor-img"
          draggable="false"
        />
      </div>
    </div>

    <!-- Страница авторизации/регистрации -->
    <div v-if="showAuthPage" class="auth-overlay" @click.self="closeAuthPage">
      <div class="auth-modal">
        <button class="close-auth" @click="closeAuthPage">×</button>
        
        <div class="auth-content">
          <h2 class="auth-title">Добро пожаловать</h2>
          
          <!-- Форма входа -->
          <div v-if="authMode === 'login'" class="auth-form">
            <div class="input-group">
              <input 
                type="text" 
                v-model="loginForm.username" 
                placeholder="Логин"
                class="auth-input"
                @keyup.enter="handleLogin"
              />
            </div>
            <div class="input-group">
              <input 
                type="password" 
                v-model="loginForm.password" 
                placeholder="Пароль"
                class="auth-input"
                @keyup.enter="handleLogin"
              />
            </div>
            <button class="auth-submit" @click="handleLogin">Войти</button>
            <p class="auth-switch">
              Нет аккаунта? 
              <span class="auth-link" @click="switchToRegister">Зарегистрироваться</span>
            </p>
          </div>
          
          <!-- Форма регистрации -->
          <div v-else class="auth-form">
            <div class="input-group">
              <input 
                type="text" 
                v-model="registerForm.name" 
                placeholder="Имя"
                class="auth-input"
              />
            </div>
            <div class="input-group">
              <input 
                type="tel" 
                v-model="registerForm.phone" 
                placeholder="Номер телефона"
                class="auth-input"
              />
            </div>
            <div class="input-group">
              <input 
                type="email" 
                v-model="registerForm.email" 
                placeholder="Email"
                class="auth-input"
              />
            </div>
            <button class="auth-submit" @click="handleRegister">Зарегистрироваться</button>
            <p class="auth-switch">
              Уже есть аккаунт? 
              <span class="auth-link" @click="switchToLogin">Войти</span>
            </p>
          </div>
        </div>
      </div>
      
      <div 
        v-if="isOnDarkOverlay" 
        class="custom-cursor"
        :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
      >
        <img 
          src="/src/public/krest.png" 
          alt="cursor" 
          class="cursor-img"
          draggable="false"
        />
      </div>
    </div>

    <!-- Страница профиля -->
    <div v-if="showProfilePage && currentUser" class="profile-overlay" @click.self="closeProfilePage">
      <div class="profile-modal">
        
        <div class="profile-content">
          <div class="profile-header">
            <div class="profile-avatar">
              <div class="avatar-circle">
                {{ currentUser.name.charAt(0).toUpperCase() }}
              </div>
            </div>
            <h2 class="profile-name">{{ currentUser.name }}</h2>
            <button class="logout-btn" @click="logout">Выйти</button>
          </div>

          <div class="profile-info">
            <h3>Информация профиля</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Имя:</span>
                <span class="info-value">{{ currentUser.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Логин:</span>
                <span class="info-value">{{ currentUser.username }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Телефон:</span>
                <span class="info-value">{{ currentUser.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">{{ currentUser.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Дата регистрации:</span>
                <span class="info-value">{{ currentUser.registeredAt }}</span>
              </div>
            </div>
          </div>

          <div class="profile-orders">
            <h3>История заказов</h3>
            <div v-if="userOrders.length > 0" class="orders-list">
              <div v-for="order in userOrders" :key="order.id" class="order-card">
                <div class="order-header">
                  <span class="order-id">Заказ #{{ order.id }}</span>
                  <span class="order-date">{{ order.date }}</span>
                </div>
                <div class="order-items">{{ order.items }}</div>
                <div class="order-footer">
                  <span class="order-total">{{ order.total }}</span>
                  <span class="order-status" :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="no-orders">
              <p>У вас пока нет заказов</p>
            </div>
          </div>
        </div>
      </div>
      
      <div 
        v-if="isOnDarkOverlay" 
        class="custom-cursor"
        :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
      >
        <img 
          src="/src/public/krest.png" 
          alt="cursor" 
          class="cursor-img"
          draggable="false"
        />
      </div>
    </div>

    <!-- Страница корзины -->
    <div v-if="showCartPage" class="cart-overlay" @click.self="closeCartPage">
      <div class="cart-modal">
      
        
        <div class="cart-content">
          <div class="cart-header">
            <h2 class="cart-title">Корзина</h2>
          </div>

          <div v-if="cartItems.length > 0" class="cart-items">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <div class="cart-item-info">
                <h3 class="cart-item-name">{{ item.name }}</h3>
                <p class="cart-item-price">{{ item.price }} ₽</p>
              </div>
              <div class="cart-item-quantity">
                <button class="quantity-btn">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button class="quantity-btn">+</button>
              </div>
              <button class="remove-item">Удалить</button>
            </div>
            
            <div class="cart-footer">
              <div class="cart-total">
                <span>Итого:</span>
                <span class="total-price">{{ cartTotal }} ₽</span>
              </div>
              <button class="checkout-btn">Оформить заказ</button>
            </div>
          </div>
          
          <div v-else class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <h3 class="empty-cart-title">Ваша корзина пуста</h3>
            <p class="empty-cart-text">Добавьте товары в корзину, чтобы сделать заказ</p>
            <button class="continue-shopping" @click="closeCartPage">Продолжить покупки</button>
          </div>
        </div>
      </div>
      
      <div 
        v-if="isOnDarkOverlay" 
        class="custom-cursor"
        :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
      >
        <img 
          src="/src/public/krest.png" 
          alt="cursor" 
          class="cursor-img"
          draggable="false"
        />
      </div>
    </div>
  
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
      <RouterView />
    </div>
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

.custom-cursor {
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  transform: translate(-50%, -50%);
}

.cursor-img {
  width: 120px;
  height: 120px;
  display: block;
  pointer-events: none;
  user-select: none;
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

.white-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 10px 0;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  height: 60px;
}

.logo {
  height: 100%;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.contact-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.address {
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.phone {
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  color: #E9544E;
  font-weight: 800;
  white-space: nowrap;
}

.icons-section {
  display: flex;
  gap: 15px;
  align-items: center;
}

.icon-img {
  width: 45px;
  height: 45px;
  object-fit: contain;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-img:hover {
  transform: scale(1.1);
  opacity: 0.8;
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
  justify-content: center;
  transform: translateY(-20%);
  padding-top: 100px;
}

.header-wrapper {
  display: flex;
  justify-content: center; 
  margin-bottom: 30px;
}

.title-container {
  position: relative;
  display: inline-block;
  text-align: center;
}

.frame-image {
  position: absolute;
  top: -80px;
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
  top: 160px;
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
  top: 190%;
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
}

.sushi-tagline {
  position: absolute;
  bottom: -35px;
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

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
}

.side-menu {
  position: relative;
  width: 25%;
  height: 100%;
  background-color: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  z-index: 2002;
  padding: 100px 20px 20px 20px;
  overflow-y: auto;
  cursor: auto;
}

.dark-overlay {
  position: relative;
  width: 75%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2001;
}

.menu-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  gap: 30px;
}

.menu-item {
  font-family: 'Courier New', Courier, monospace;
  font-size: 28px;
  font-weight: 700;
  color: #333;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px 20px;
  border-radius: 8px;
}

.menu-item:hover {
  color: #E9544E;
  transform: scale(1.05);
  background-color: rgba(233, 84, 78, 0.1);
}

/* Стили для страницы авторизации */
.auth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

.auth-modal {
  position: relative;
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 450px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

/* Стили для страницы корзины */
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
  padding: 20px;
}

.cart-modal {
  position: relative;
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

.cart-modal::-webkit-scrollbar {
  width: 8px;
}

.cart-modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.cart-modal::-webkit-scrollbar-thumb {
  background: #E9544E;
  border-radius: 10px;
}

.close-cart {
  position: sticky;
  top: 15px;
  right: 20px;
  float: right;
  font-size: 32px;
  background: white;
  border: none;
  cursor: pointer;
  color: #999;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 10;
  margin: 10px;
}

.close-cart:hover {
  color: #E9544E;
  transform: scale(1.1);
  background-color: rgba(233, 84, 78, 0.1);
}

.cart-content {
  padding: 20px 40px 40px 40px;
}

.cart-header {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 20px;
}

.cart-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 32px;
  color: #333;
  font-weight: 700;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.cart-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.cart-item-info {
  flex: 2;
}

.cart-item-name {
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  color: #333;
  margin-bottom: 5px;
}

.cart-item-price {
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  color: #E9544E;
  font-weight: bold;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0 20px;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.quantity-btn:hover {
  background: #E9544E;
  color: white;
  border-color: #E9544E;
}

.quantity {
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.remove-item {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  transition: all 0.3s ease;
  padding: 5px 10px;
  border-radius: 6px;
}

.remove-item:hover {
  color: #E9544E;
  background-color: rgba(233, 84, 78, 0.1);
}

.cart-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.total-price {
  color: #E9544E;
  font-size: 28px;
}

.checkout-btn {
  width: 100%;
  background: #E9544E;
  color: white;
  border: none;
  padding: 15px;
  font-size: 18px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  background: #d43f39;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(233, 84, 78, 0.3);
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
}

.empty-cart-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-cart-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.empty-cart-text {
  font-family: 'Courier New', Courier, monospace;
  color: #999;
  margin-bottom: 30px;
}

.continue-shopping {
  background: #E9544E;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-shopping:hover {
  background: #d43f39;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(233, 84, 78, 0.3);
}

/* Стили для страницы профиля */
.profile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
  overflow-y: auto;
  padding: 20px;
}

.profile-modal {
  position: relative;
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

.profile-modal::-webkit-scrollbar {
  width: 8px;
}

.profile-modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.profile-modal::-webkit-scrollbar-thumb {
  background: #E9544E;
  border-radius: 10px;
}

.close-profile {
  position: sticky;
  top: 15px;
  right: 20px;
  float: right;
  font-size: 32px;
  background: white;
  border: none;
  cursor: pointer;
  color: #999;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 10;
  margin: 10px;
}

.close-profile:hover {
  color: #E9544E;
  transform: scale(1.1);
  background-color: rgba(233, 84, 78, 0.1);
}

.profile-content {
  padding: 20px 40px 40px 40px;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-avatar {
  margin-bottom: 20px;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #E9544E 0%, #FFBF9C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 48px;
  font-weight: bold;
  color: white;
  font-family: 'Courier New', Courier, monospace;
}

.profile-name {
  font-family: 'Courier New', Courier, monospace;
  font-size: 32px;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.logout-btn {
  background: #E9544E;
  color: white;
  border: none;
  padding: 10px 30px;
  font-size: 16px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.logout-btn:hover {
  background: #d43f39;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(233, 84, 78, 0.3);
}

.profile-info {
  margin-bottom: 40px;
}

.profile-info h3, .profile-orders h3 {
  font-family: 'Courier New', Courier, monospace;
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #E9544E;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
}

.info-value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.profile-orders {
  margin-bottom: 20px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.order-card:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-family: 'Courier New', Courier, monospace;
}

.order-id {
  font-weight: bold;
  color: #E9544E;
  font-size: 16px;
}

.order-date {
  color: #999;
  font-size: 14px;
}

.order-items {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.4;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-total {
  font-weight: bold;
  color: #333;
  font-size: 18px;
}

.order-status {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.order-status.delivered {
  background: #d4edda;
  color: #155724;
}

.order-status.in-progress {
  background: #fff3cd;
  color: #856404;
}

.order-status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.no-orders {
  text-align: center;
  padding: 40px;
  color: #999;
  font-family: 'Courier New', Courier, monospace;
  background: #f9f9f9;
  border-radius: 12px;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-auth {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 32px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  transition: all 0.3s ease;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-auth:hover {
  color: #E9544E;
  transform: scale(1.1);
  background-color: rgba(233, 84, 78, 0.1);
}

.auth-content {
  text-align: center;
}

.auth-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 32px;
  color: #333;
  margin-bottom: 40px;
  font-weight: 700;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  width: 100%;
}

.auth-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 16px;
  font-family: 'Courier New', Courier, monospace;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  outline: none;
}

.auth-input:focus {
  border-color: #E9544E;
  box-shadow: 0 0 0 3px rgba(233, 84, 78, 0.1);
}

.auth-submit {
  background: #E9544E;
  color: white;
  border: none;
  padding: 14px 28px;
  font-size: 18px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.auth-submit:hover {
  background: #d43f39;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(233, 84, 78, 0.3);
}

.auth-submit:active {
  transform: translateY(0);
}

.auth-switch {
  margin-top: 20px;
  font-family: 'Courier New', Courier, monospace;
  color: #666;
  font-size: 14px;
}

.auth-link {
  color: #E9544E;
  cursor: pointer;
  font-weight: 700;
  text-decoration: underline;
  transition: all 0.3s ease;
}

.auth-link:hover {
  color: #d43f39;
  transform: scale(1.05);
}

/* Адаптивность */
@media (max-width: 768px) {
  .side-menu {
    width: 70%;
  }
  
  .dark-overlay {
    width: 30%;
  }
  
  .menu-item {
    font-size: 22px;
  }
  
  .auth-modal {
    padding: 30px 25px;
    width: 95%;
  }
  
  .auth-title {
    font-size: 28px;
    margin-bottom: 30px;
  }
  
  .auth-input {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .auth-submit {
    padding: 12px 24px;
    font-size: 16px;
  }
  
  .profile-content,
  .cart-content {
    padding: 20px;
  }
  
  .profile-name {
    font-size: 24px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .order-header {
    flex-direction: column;
    gap: 5px;
  }
  
  .cart-item {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .cart-item-quantity {
    margin: 10px 0;
  }
}

@media (max-width: 480px) {
  .side-menu {
    width: 85%;
  }
  
  .dark-overlay {
    width: 15%;
  }
  
  .menu-item {
    font-size: 18px;
  }
  
  .auth-modal {
    padding: 25px 20px;
  }
  
  .auth-title {
    font-size: 24px;
    margin-bottom: 25px;
  }
  
  .auth-input {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .auth-submit {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .avatar-circle {
    width: 70px;
    height: 70px;
    font-size: 32px;
  }
  
  .profile-name {
    font-size: 20px;
  }
  
  .profile-info h3, .profile-orders h3,
  .cart-title {
    font-size: 20px;
  }
  
  .info-value {
    font-size: 16px;
  }
  
  .cart-total {
    font-size: 20px;
  }
  
  .total-price {
    font-size: 24px;
  }
}

@media (max-width: 1100px) {
  .sushi-tagline {
    right: -100px;
    font-size: 14px;
  }
  
  .frame-image {
    max-width: 400px;
    top: -60px;
  }
  
  .blur-circle {
    width: 300px;
    height: 300px;
    top: 100px;
  }
  
  .hap-image {
    max-width: 200px;
  }
  
  .icon-img {
    width: 35px;
    height: 35px;
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
  
  .frame-image {
    position: relative;
    top: 0;
    left: 0;
    transform: none;
    margin-bottom: 20px;
  }
  
  .blur-circle {
    position: relative;
    top: -20px;
    margin-bottom: -50px;
  }
  
  .hap-image {
    position: relative;
    top: -40px;
    margin-bottom: -60px;
  }
}

@media (max-width: 900px) {
  .header-container {
    justify-content: center;
  }
  
  .icons-section {
    order: 2;
  }
  
  .left-section {
    order: 1;
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .left-section {
    flex-direction: column;
    gap: 10px;
  }
  
  .contact-section {
    align-items: center;
  }
  
  .address, .phone {
    white-space: normal;
    text-align: center;
    font-size: 14px;
  }
  
  h1 {
    font-size: 60px;
  }
  
  .logo-section {
    height: 45px;
  }
  
  .icon-img {
    width: 30px;
    height: 30px;
  }
  
  .frame-image {
    max-width: 300px;
  }
  
  .blur-circle {
    width: 250px;
    height: 250px;
  }
  
  .hap-image {
    max-width: 150px;
  }
  
  .icons-section {
    gap: 10px;
  }
}
</style>