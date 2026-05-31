<template>
  <div v-if="isOpen" class="search-overlay" @click.self="$emit('close')">
    <div class="search-modal">
      <div class="search-header">
        <div class="search-input-container">
          <div class="search-line">
            <input 
              type="text" 
              :value="query"
              @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
              placeholder="Поиск"
              class="search-input"
              @keyup.enter="$emit('search')"
            />
            <img src="/src/public/ser.png" alt="Search" class="search-icon" @click="$emit('search')" />
          </div>
        </div>
      </div>
      
      <div class="search-results">
        <div class="search-placeholder">
          <p>Введите название ролла для поиска</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  query: string
}>()

defineEmits<{
  close: []
  search: []
  'update:query': [query: string]
}>()
</script>

<style scoped>
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 3000;
  display: flex;
  justify-content: flex-end;
  backdrop-filter: blur(5px);
}

.search-modal {
  position: relative;
  background: white;
  width: 30%;
  height: 100%;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.2);
  animation: slideInRight 0.3s ease;
  display: flex;
  flex-direction: column;
}

.search-header {
  padding: 30px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.search-input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-line {
  display: flex;
  align-items: center;
  background: transparent;
  border-bottom: 2px solid #333;
  padding: 10px 5px;
}

.search-input {
  flex: 1;
  padding: 10px 0;
  font-size: 18px;
  font-family: 'Courier New', Courier, monospace;
  border: none;
  background: transparent;
  outline: none;
}

.search-input::placeholder {
  color: #999;
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
}

.search-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.search-icon:hover {
  opacity: 1;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.search-placeholder {
  text-align: center;
  padding: 40px;
  color: #999;
  font-family: 'Courier New', Courier, monospace;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .search-modal {
    width: 70%;
  }
  
  .search-input {
    font-size: 16px;
  }
  
  .search-input::placeholder {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .search-modal {
    width: 85%;
  }
  
  .search-input {
    font-size: 14px;
  }
  
  .search-input::placeholder {
    font-size: 14px;
  }
}
</style>