<script setup lang="ts">
import { ref, onUnmounted, watch, onMounted, computed } from 'vue'

import Header from './components/layout/Header.vue'
import MenuOverlay from './components/layout/MenuOverlay.vue'
import CustomCursor from './components/common/CustomCursor.vue'
import AuthModal from './components/modals/AuthModal.vue'
import ForgotPasswordModal from './components/modals/ForgotPasswordModal.vue'
import ProfileModal from './components/modals/ProfileModal.vue'
import CartModal from './components/modals/CartModal.vue'
import SearchModal from './components/modals/SearchModal.vue'
import FilterModal from './components/modals/FilterModal.vue'
import CategorySection from './components/merchandise/CategorySection.vue'

import { api, type Category } from './services/api'

const isMenuOpen       = ref(false)
const cursorX          = ref(0)
const cursorY          = ref(0)
const isOnDarkOverlay  = ref(false)
const showAuthPage     = ref(false)
const showProfilePage  = ref(false)
const showCartPage     = ref(false)
const showForgotPasswordPage = ref(false)
const showSearchPage   = ref(false)
const showFilterPage   = ref(false)
const authMode         = ref<'login' | 'register'>('login')
const currentUser      = ref<any>(null)

const loginForm        = ref({ username: '', password: '' })
const registerForm     = ref({ name: '', phone: '', email: '', password: '', confirmPassword: '' })
const forgotPasswordEmail = ref('')
const searchQuery      = ref('')

const availableIngredients = ['Лосось','Угорь','Креветка','Огурец','Авокадо','Рис','Нори','Сыр','Икра','Тунец']
const selectedIngredients  = ref<string[]>([])

const categories = ref<Category[]>([])
const isLoading  = ref(true)
const error      = ref<string | null>(null)

interface CartItem { merchandiseId: number; variationId: number; quantity: number; merchandise: any; variation: any }
const cartItems = ref<CartItem[]>([])
const cartTotal = ref(0)

const cartQuantities = computed(() => {
  const map: Record<string, number> = {}
  for (const item of cartItems.value) map[`${item.merchandiseId}_${item.variationId}`] = item.quantity
  return map
})

const anchorCategories  = ref<{ id: string; name: string }[]>([])
const activeCategory    = ref<string>('')
// насколько каталог перекрывает героя (0 = не начали, 1 = полностью)
const catalogScrollRatio = ref(0)

// drag
const isDragging     = ref(false)
const dragStartX     = ref(0)
const dragScrollLeft = ref(0)

// ─── Auth ─────────────────────────────────────────────────────────────────────
const saveSession  = (u: any) => u ? localStorage.setItem('currentUser', JSON.stringify(u)) : localStorage.removeItem('currentUser')
const loadSession  = () => { const s = localStorage.getItem('currentUser'); if (s) currentUser.value = JSON.parse(s) }
const clearSession = () => { localStorage.removeItem('currentUser'); currentUser.value = null }

const handleLogin = () => {
  if (loginForm.value.username && loginForm.value.password) {
    currentUser.value = { name: loginForm.value.username, username: loginForm.value.username, phone: '+7 (XXX) XXX-XX-XX', email: `${loginForm.value.username}@example.com`, registeredAt: new Date().toLocaleDateString('ru-RU') }
    saveSession(currentUser.value); closeAuthPage(); showProfilePage.value = true
  } else alert('Пожалуйста, заполните все поля')
}
const handleRegister = () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) { alert('Пароли не совпадают'); return }
  if (registerForm.value.password.length < 6) { alert('Пароль должен содержать минимум 6 символов'); return }
  if (registerForm.value.name && registerForm.value.phone && registerForm.value.email && registerForm.value.password) {
    currentUser.value = { name: registerForm.value.name, username: registerForm.value.name.toLowerCase().replace(/\s/g,''), phone: registerForm.value.phone, email: registerForm.value.email, registeredAt: new Date().toLocaleDateString('ru-RU') }
    saveSession(currentUser.value); closeAuthPage(); showProfilePage.value = true
  } else alert('Пожалуйста, заполните все поля')
}
const handleForgotPassword = () => {
  if (forgotPasswordEmail.value) { alert(`Инструкции отправлены на ${forgotPasswordEmail.value}`); closeForgotPassword() }
  else alert('Пожалуйста, введите email')
}
const logout = () => { clearSession(); showProfilePage.value = false; alert('Вы вышли из аккаунта') }

const toggleMenu  = () => { isMenuOpen.value = !isMenuOpen.value }
const closeMenu   = () => { isMenuOpen.value = false }
const openAuthPage  = () => { showAuthPage.value = true; closeMenu() }
const closeAuthPage = () => {
  showAuthPage.value = false; showForgotPasswordPage.value = false; authMode.value = 'login'
  loginForm.value = { username: '', password: '' }
  registerForm.value = { name: '', phone: '', email: '', password: '', confirmPassword: '' }
  forgotPasswordEmail.value = ''
}
const openProfile     = () => { currentUser.value ? (showProfilePage.value = true) : openAuthPage(); closeMenu() }
const closeProfilePage  = () => { showProfilePage.value = false }
const openCart        = () => { showCartPage.value = true; closeMenu() }
const closeCartPage   = () => { showCartPage.value = false }
const openSearch      = () => { showSearchPage.value = true; closeMenu() }
const closeSearchPage = () => { showSearchPage.value = false; searchQuery.value = '' }
const openFilter      = () => { showFilterPage.value = true; closeMenu() }
const closeFilterPage = () => { showFilterPage.value = false }
const openForgotPassword  = () => { showForgotPasswordPage.value = true }
const closeForgotPassword = () => { showForgotPasswordPage.value = false; forgotPasswordEmail.value = '' }
const switchToLogin    = () => { authMode.value = 'login' }
const switchToRegister = () => { authMode.value = 'register' }

const toggleIngredient = (i: string) => {
  const idx = selectedIngredients.value.indexOf(i)
  idx === -1 ? selectedIngredients.value.push(i) : selectedIngredients.value.splice(idx, 1)
}
const resetFilters = () => { selectedIngredients.value = [] }
const applyFilters = () => { closeFilterPage() }

// ─── Cart ─────────────────────────────────────────────────────────────────────
const addToCart = (merchandiseId: number, variationId: number, quantityChange: number) => {
  const existing = cartItems.value.find(i => i.merchandiseId === merchandiseId && i.variationId === variationId)
  if (existing) {
    existing.quantity += quantityChange
    if (existing.quantity <= 0)
      cartItems.value = cartItems.value.filter(i => !(i.merchandiseId === merchandiseId && i.variationId === variationId))
  } else if (quantityChange > 0) {
    for (const cat of categories.value) {
      const merch = cat.merchandises.find(m => m.id === merchandiseId)
      if (merch) {
        const v = merch.variations.find(v => v.id === variationId)
        if (v) { cartItems.value.push({ merchandiseId, variationId, quantity: quantityChange, merchandise: merch, variation: v }); break }
      }
    }
  }
  cartTotal.value = cartItems.value.reduce((s, i) => s + (i.variation?.price || 0) * i.quantity, 0)
}
const removeFromCart = (merchandiseId: number, variationId: number) => {
  cartItems.value = cartItems.value.filter(i => !(i.merchandiseId === merchandiseId && i.variationId === variationId))
  cartTotal.value = cartItems.value.reduce((s, i) => s + (i.variation?.price || 0) * i.quantity, 0)
}

// ─── Scroll ───────────────────────────────────────────────────────────────────
// Высота фиксированной «шапки» (хедер + герой + якорная панель)
// = всё, что идёт до каталога.
// Каталог начинает скролл после того как пролистали весь hero-блок.
const HEADER_H  = 80   // высота хедера
const HERO_H    = computed(() => window.innerHeight - HEADER_H)  // герой на весь экран
const ANCHOR_H  = 76   // высота якорной панели

// Смещение скролла, при котором каталог начинает появляться из-за низа экрана
const catalogStartScroll = computed(() => HERO_H.value + ANCHOR_H)

const scrollToCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  const el = document.getElementById(categoryId)
  if (!el) return
  // el.offsetTop — позиция внутри .catalog-scroll
  // прибавляем начало каталога в общем скролле
  const catalogEl = document.querySelector('.catalog-scroll') as HTMLElement
  if (!catalogEl) return
  const itemTop = el.offsetTop
  window.scrollTo({ top: catalogStartScroll.value + itemTop - 16, behavior: 'smooth' })
}

const handleScroll = () => {
  const scrollY = window.scrollY
  const start   = catalogStartScroll.value

  // ratio: 0 пока не начали скролл каталога, >0 когда каталог виден
  catalogScrollRatio.value = Math.max(0, Math.min(1, scrollY / start))

  // активная категория
  if (scrollY >= start) {
    const offsetInCatalog = scrollY - start + 32
    let current = anchorCategories.value[0]?.id || ''
    for (const cat of anchorCategories.value) {
      const el = document.getElementById(cat.id)
      if (el && el.offsetTop <= offsetInCatalog) current = cat.id
    }
    if (current !== activeCategory.value) activeCategory.value = current
  }
}

// anchor drag
const startAnchorDrag = (e: MouseEvent) => {
  isDragging.value = true
  const c = e.currentTarget as HTMLElement
  dragStartX.value = e.pageX - c.offsetLeft; dragScrollLeft.value = c.scrollLeft
  c.style.cursor = 'grabbing'
}
const stopAnchorDrag  = (e: MouseEvent) => { isDragging.value = false; (e.currentTarget as HTMLElement).style.cursor = 'grab' }
const onAnchorDrag    = (e: MouseEvent) => {
  if (!isDragging.value) return; e.preventDefault()
  const c = e.currentTarget as HTMLElement
  c.scrollLeft = dragScrollLeft.value - (e.pageX - c.offsetLeft - dragStartX.value) * 1.5
}
const handleAnchorWheel = (e: WheelEvent) => { (e.currentTarget as HTMLElement).scrollLeft += e.deltaY; e.preventDefault() }

// ─── Custom cursor ────────────────────────────────────────────────────────────
const handleMouseMove = (e: MouseEvent) => {
  cursorX.value = e.clientX; cursorY.value = e.clientY
  let onDark = false
  const checkModal = (sel: string) => {
    const el = document.querySelector(sel); if (!el) return true
    const r = el.getBoundingClientRect()
    return !(e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom)
  }
  if (isMenuOpen.value) { const pct = window.innerWidth <= 480 ? 85 : window.innerWidth <= 768 ? 70 : 25; onDark = e.clientX > window.innerWidth * pct / 100 }
  else if (showSearchPage.value)         onDark = checkModal('.search-modal')
  else if (showFilterPage.value)         onDark = checkModal('.filter-modal')
  else if (showForgotPasswordPage.value) onDark = checkModal('.forgot-password-modal')
  else if (showAuthPage.value)           onDark = checkModal('.auth-modal')
  else if (showProfilePage.value)        onDark = checkModal('.profile-modal')
  else if (showCartPage.value)           onDark = checkModal('.cart-modal')
  if (onDark !== isOnDarkOverlay.value) { isOnDarkOverlay.value = onDark; document.body.style.cursor = onDark ? 'none' : '' }
}
watch([isMenuOpen, showAuthPage, showForgotPasswordPage, showProfilePage, showCartPage, showSearchPage, showFilterPage], (vals) => {
  if (vals.some(Boolean)) document.addEventListener('mousemove', handleMouseMove)
  else { document.removeEventListener('mousemove', handleMouseMove); document.body.style.cursor = ''; isOnDarkOverlay.value = false }
})

// ─── Data ─────────────────────────────────────────────────────────────────────
const loadData = async () => {
  isLoading.value = true; error.value = null
  try {
    const data = await api.getMerchandise()
    categories.value = data
    anchorCategories.value = data.map(c => ({ id: c.slug, name: c.name.toUpperCase() }))
    if (anchorCategories.value.length) activeCategory.value = anchorCategories.value[0].id
  } catch {
    error.value = 'Не удалось загрузить товары.'
    anchorCategories.value = [
      { id: 'business-lunch', name: 'БИЗНЕС-ЛАНЧ' }, { id: 'mini-rolls', name: 'РОЛЛЫ МИНИ' },
      { id: 'rolls', name: 'РОЛЛЫ' }, { id: 'fried-rolls', name: 'ЖАРЕНЫЕ РОЛЛЫ' },
      { id: 'baked-rolls', name: 'ЗАПЕЧЕННЫЕ РОЛЛЫ' }, { id: 'pizza', name: 'ПИЦЦА' },
      { id: 'wok', name: 'ЛАПША WOK' }, { id: 'related', name: 'СОПУТСТВУЮЩИЕ ТОВАРЫ' },
    ]
    activeCategory.value = anchorCategories.value[0].id
  } finally { isLoading.value = false }
}

onMounted(() => {
  loadSession(); loadData()
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('mousemove', handleMouseMove)
  document.body.style.cursor = ''
})
</script>

<template>
  <!-- ═══ ФИКСИРОВАННЫЙ ЗАДНИЙ СЛОЙ: фон + хедер + герой + якорная панель ═══ -->

  <!-- Декоративные круги -->
  <div class="bg-circles" aria-hidden="true">
    <div class="circle c1"></div><div class="circle c2"></div>
    <div class="circle c3"></div><div class="circle c4"></div><div class="circle c5"></div>
  </div>

  <!-- Хедер (всегда поверх всего) -->
  <Header :isMenuOpen="isMenuOpen" @toggleMenu="toggleMenu" @openCart="openCart" @openProfile="openProfile" />

  <!-- Герой — фиксирован под хедером, всегда виден -->
  <div class="hero-fixed">
    <div class="title-container">
      <img src="/src/public/ram.png" alt="" class="frame-image" />
      <div class="blur-circle"></div>
      <img src="/src/public/hap.png" alt="" class="hap-image" />
      <h1>Суши<br>Лавка</h1>
      <div class="sushi-tagline">пожалуй,<br>самые большие<br>роллы</div>
    </div>
  </div>

  <!-- Якорная панель — фиксирована под героем -->
  <div class="anchor-bar-fixed">
    <div class="anchor-bar__inner">
      <div class="anchor-icons">
        <img
          :src="selectedIngredients.length ? '/src/public/settings1.png' : '/src/public/settings.png'"
          alt="Фильтр" class="anchor-icon" @click="openFilter"
        />
        <img
          :src="showSearchPage ? '/src/public/search1.png' : '/src/public/search.png'"
          alt="Поиск" class="anchor-icon" @click="openSearch"
        />
      </div>
      <div class="vertical-divider"></div>
      <div class="anchor-buttons-wrapper">
        <div
          class="anchor-buttons-container"
          @mousedown="startAnchorDrag" @mouseup="stopAnchorDrag"
          @mouseleave="stopAnchorDrag" @mousemove="onAnchorDrag"
          @wheel.prevent="handleAnchorWheel"
        >
          <button
            v-for="cat in anchorCategories" :key="cat.id"
            class="anchor-button"
            :class="{ active: activeCategory === cat.id }"
            @click="scrollToCategory(cat.id)"
          >{{ cat.name }}</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ СКРОЛЛИРУЕМЫЙ СЛОЙ: пустой spacer + каталог ═══ -->
  <div class="scroll-layer">
    <!-- Пустое место высотой = герой + якорная панель -->
    <!-- Пользователь скроллит здесь, а каталог выезжает снизу поверх героя -->
    <div class="hero-spacer"></div>
    <div class="anchor-spacer"></div>

    <!-- Каталог — белый блок, выезжает снизу при скролле -->
    <div class="catalog-scroll">
      <div class="catalog-inner">
        <div v-if="isLoading" class="state-loading">
          <div class="spinner"></div>
          <p>Загрузка меню…</p>
        </div>
        <div v-else-if="error && categories.length === 0" class="state-error">
          <p>{{ error }}</p>
          <button class="retry-btn" @click="loadData">Повторить</button>
        </div>
        <template v-else>
          <CategorySection
            v-for="cat in categories" :key="cat.id"
            :category="cat" :cartQuantities="cartQuantities"
            @addToCart="addToCart" @removeFromCart="removeFromCart"
          />
        </template>
      </div>
    </div>
  </div>

  <!-- Меню -->
  <MenuOverlay :isOpen="isMenuOpen" :isLoggedIn="!!currentUser" @close="closeMenu" @login="openAuthPage" />

  <!-- Модалки -->
  <AuthModal
    :isOpen="showAuthPage && !showForgotPasswordPage" :mode="authMode"
    :loginForm="loginForm" :registerForm="registerForm"
    @close="closeAuthPage" @login="handleLogin" @register="handleRegister"
    @forgotPassword="openForgotPassword" @switchToLogin="switchToLogin" @switchToRegister="switchToRegister"
    @update:loginForm="f => loginForm = f" @update:registerForm="f => registerForm = f"
  />
  <ForgotPasswordModal :isOpen="showForgotPasswordPage" :email="forgotPasswordEmail"
    @close="closeForgotPassword" @submit="handleForgotPassword" @update:email="e => forgotPasswordEmail = e" />
  <ProfileModal :isOpen="showProfilePage" :user="currentUser" :orders="[]"
    @close="closeProfilePage" @logout="logout" />
  <CartModal
    :isOpen="showCartPage"
    :cartItems="cartItems.map(i => ({ merchandiseId: i.merchandiseId, variationId: i.variationId, quantity: i.quantity }))"
    :categories="categories"
    @close="closeCartPage" @checkout="() => {}"
    @increment="(mId, vId) => addToCart(mId, vId, 1)"
    @decrement="(mId, vId) => addToCart(mId, vId, -1)"
    @remove="removeFromCart"
  />
  <SearchModal :isOpen="showSearchPage" :query="searchQuery"
    @close="closeSearchPage" @search="() => {}" @update:query="q => searchQuery = q" />
  <FilterModal :isOpen="showFilterPage" :ingredients="availableIngredients" :selectedIngredients="selectedIngredients"
    @close="closeFilterPage" @apply="applyFilters" @reset="resetFilters" @toggleIngredient="toggleIngredient" />
  <CustomCursor :visible="isOnDarkOverlay" :x="cursorX" :y="cursorY" />
</template>

<style>
/* ── Reset ───────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { overflow-x: hidden; }
body { font-family: Arial, sans-serif; background: #fff; cursor: auto; overflow-x: hidden; }

/* ════════════════════════════════════════════════
   ФИКСИРОВАННЫЙ ЗАДНИЙ СЛОЙ
   Всё, что остаётся неподвижным: фон, хедер, герой, якорная панель
════════════════════════════════════════════════ */

/* Декоративные круги */
.bg-circles {
  position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;
}
.circle { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.6; }
.c1 { width: 400px; height: 400px; background: #E9544E; top: -100px; left: -100px; }
.c2 { width: 500px; height: 500px; background: #FFBF9C; bottom: -150px; right: -150px; }
.c3 { width: 300px; height: 300px; background: #FFBF9C; top: 50%; left: 20%; }
.c4 { width: 350px; height: 350px; background: #ff8c94; top: 20%; right: 10%; }
.c5 { width: 250px; height: 250px; background: #ff8c94; bottom: 30%; left: 10%; }

/* ── Герой — фиксирован, занимает экран под хедером ── */
.hero-fixed {
  position: fixed;
  top: 80px;       /* под хедером */
  left: 0; right: 0;
  /* высота = весь экран минус хедер минус якорная панель */
  height: calc(100vh - 80px - 76px);
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.title-container {
  position: relative;
  display: inline-block;
  text-align: center;
  min-height: 380px;
}

.frame-image {
  position: absolute;
  top: -250px; left: 50%;
  transform: translateX(-50%);
  width: auto; height: auto; max-width: 1600px;
  z-index: 1; pointer-events: none;
}
.blur-circle {
  position: absolute;
  top: -50px; left: 50%;
  transform: translateX(-50%);
  width: 550px; height: 550px;
  background: #FFBF9C; border-radius: 50%;
  filter: blur(50px); opacity: 0.9;
  z-index: 2; pointer-events: none;
}
.hap-image {
  position: absolute;
  top: 100%; left: 50%;
  transform: translate(-50%, -50%);
  width: auto; height: auto; max-width: 600px;
  z-index: 3; pointer-events: none;
}
h1 {
  font-family: 'ChinaCyr', 'Arial', sans-serif;
  color: #333; font-size: 96px;
  line-height: 0.9; letter-spacing: 2px;
  font-weight: normal; text-align: center;
  position: relative; z-index: 4;
  margin-top: -220px; margin-bottom: 30px;
}
.sushi-tagline {
  position: absolute;
  bottom: 180px; right: -155px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 20px; font-weight: 900;
  color: #E9544E; text-align: left;
  line-height: 1.3; white-space: nowrap; z-index: 4;
}

/* ── Якорная панель — фиксирована над низом видимой области ── */
.anchor-bar-fixed {
  position: fixed;
  /* прямо над каталогом: низ экрана минус высота панели */
  bottom: 0; left: 0; right: 0;
  height: 76px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.08);
  display: flex; align-items: center;
}

.anchor-bar__inner {
  max-width: 1200px; margin: 0 auto;
  padding: 0 20px;
  display: flex; align-items: center; gap: 20px;
  width: 100%;
}

.anchor-icons { display: flex; gap: 15px; align-items: center; flex-shrink: 0; }
.anchor-icon  { width: 40px; height: 40px; cursor: pointer; transition: transform 0.2s, opacity 0.2s; }
.anchor-icon:hover { transform: scale(1.1); opacity: 0.8; }

.vertical-divider {
  width: 2px; height: 40px; background: #E9544E;
  flex-shrink: 0; border-radius: 2px;
}

.anchor-buttons-wrapper { flex: 1; overflow: hidden; }
.anchor-buttons-container {
  display: flex; gap: 12px;
  overflow-x: auto; overflow-y: hidden;
  scrollbar-width: none; -ms-overflow-style: none;
  cursor: grab; padding: 5px 0; white-space: nowrap;
}
.anchor-buttons-container::-webkit-scrollbar { display: none; }
.anchor-buttons-container:active { cursor: grabbing; }

.anchor-button {
  background: rgba(255,255,255,0.95);
  border: 1.5px solid rgba(0,0,0,0.15);
  padding: 10px 20px; border-radius: 30px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px; font-weight: 600; color: #333;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.anchor-button:hover { border-color: #E9544E; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(233,84,78,0.2); }
.anchor-button.active { border-color: #E9544E; background: rgba(233,84,78,0.1); color: #E9544E; }

/* ════════════════════════════════════════════════
   СКРОЛЛИРУЕМЫЙ СЛОЙ
   position: relative, поверх всего фиксированного
════════════════════════════════════════════════ */
.scroll-layer {
  position: relative;
  z-index: 2;   /* выше фиксированного героя */
  pointer-events: none; /* spacer не перехватывает клики */
}

/* Пустое место под хедером + герой + якорная панель */
.hero-spacer   { height: calc(100vh - 80px - 76px); pointer-events: none; }
.anchor-spacer { height: 76px; pointer-events: none; }

/* Каталог — белый блок с закруглённым верхом, выезжает снизу */
.catalog-scroll {
  pointer-events: auto;
  background: #fff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.12);
  min-height: 100vh;
  position: relative;
  z-index: 3;
}

.catalog-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 120px;
}

/* Состояния загрузки */
.state-loading, .state-error {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 40vh; gap: 20px;
  font-family: 'Courier New', Courier, monospace; color: #666;
}
.state-error p { color: #E9544E; font-size: 18px; }
.spinner {
  width: 48px; height: 48px;
  border: 3px solid #e0e0e0; border-top-color: #E9544E;
  border-radius: 50%; animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn {
  background: #E9544E; color: #fff; border: none;
  padding: 10px 28px; font-family: 'Courier New', Courier, monospace;
  font-weight: 700; border-radius: 8px; cursor: pointer;
}
.retry-btn:hover { background: #d43f39; transform: scale(1.02); }

/* ════════════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════════════ */
@media (max-width: 950px) {
  .sushi-tagline { position: static; margin-top: 14px; text-align: center; white-space: normal; }
  .title-container { display: flex; flex-direction: column; align-items: center; }
}
@media (max-width: 768px) {
  .frame-image { max-width: 600px; }
  .blur-circle { width: 350px; height: 350px; top: 120px; }
  .hap-image   { max-width: 350px; }
  h1 { font-size: 72px; }
  .sushi-tagline { font-size: 16px; }
  .anchor-icon { width: 32px; height: 32px; }
  .vertical-divider { height: 32px; }
  .anchor-button { font-size: 12px; padding: 8px 16px; }
}
@media (max-width: 600px) { h1 { font-size: 60px; } }
@media (max-width: 480px) {
  .frame-image { max-width: 350px; top: -50px; }
  .blur-circle { width: 220px; height: 220px; top: 80px; }
  .hap-image   { max-width: 220px; }
  h1 { font-size: 48px; }
  .sushi-tagline { font-size: 12px; }
  .anchor-icon { width: 28px; height: 28px; }
  .vertical-divider { height: 28px; }
  .anchor-button { font-size: 10px; padding: 6px 12px; }
}
</style>
