<template>
  <div v-if="isOpen" class="menu-overlay">
    <div class="side-menu">
      <div class="menu-content">
        <button class="menu-login-btn" @click="onLoginClick">
          {{ isLoggedIn ? 'Мой кабинет' : 'Войти' }}
        </button>
        
        <div class="menu-items">
          <div class="menu-item">Главная</div>
          <div class="menu-item">Меню</div>
          <div class="menu-item">Акции</div>
          <div class="menu-item">Контакты</div>
          <div class="menu-item">О нас</div>
        </div>
      </div>
    </div>
    
    <div class="dark-overlay" @click="$emit('close')"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  isLoggedIn: boolean
}>()

const emit = defineEmits<{
  close: []
  login: []
}>()

const onLoginClick = () => {
  if (!props.isLoggedIn) {
    emit('login')
  }
  emit('close')
}
</script>

<style scoped>
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
  padding: 80px 20px 20px 20px;
  overflow-y: auto;
  cursor: auto;
}

.dark-overlay {
  position: relative;
  width: 75%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2001;
  cursor: pointer;
}

.menu-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  gap: 0;
}

.menu-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  margin-top: 40px;
  width: 100%;
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

.menu-login-btn {
  background: #E9544E;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 22px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 200px;
  letter-spacing: 1px;
}

.menu-login-btn:hover {
  background: #d43f39;
  transform: scale(1.02);
  box-shadow: 0 3px 10px rgba(233, 84, 78, 0.3);
}

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
  
  .menu-login-btn {
    font-size: 18px;
    padding: 10px 25px;
    max-width: 180px;
  }
  
  .menu-items {
    gap: 25px;
    margin-top: 35px;
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
  
  .menu-login-btn {
    font-size: 16px;
    padding: 8px 20px;
    max-width: 160px;
  }
  
  .menu-items {
    gap: 20px;
    margin-top: 30px;
  }
}
</style>