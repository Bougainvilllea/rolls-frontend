<template>
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
          @click="$emit('toggleMenu')"
        />
        <img 
          src="/src/public/kor.png" 
          alt="Kor" 
          class="icon-img" 
          @click="$emit('openCart')"
        />
        <img 
          src="/src/public/prof.png" 
          alt="Prof" 
          class="icon-img" 
          @click="$emit('openProfile')"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  isMenuOpen: boolean
}>()

defineEmits<{
  toggleMenu: []
  openCart: []
  openProfile: []
}>()
</script>

<style scoped>
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
  
  .logo-section {
    height: 45px;
  }
  
  .icon-img {
    width: 30px;
    height: 30px;
  }
  
  .icons-section {
    gap: 10px;
  }
}
</style>