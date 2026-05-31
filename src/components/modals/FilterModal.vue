<template>
  <div v-if="isOpen" class="filter-overlay" @click.self="$emit('close')">
    <div class="filter-modal">
      <button class="close-filter" @click="$emit('close')">×</button>
      
      <div class="filter-content">
        <h2 class="filter-title">Фильтр по ингредиентам</h2>
        
        <div class="filter-options">
          <div 
            v-for="ingredient in ingredients" 
            :key="ingredient"
            class="filter-option"
            @click="$emit('toggleIngredient', ingredient)"
          >
            <div class="checkbox" :class="{ checked: selectedIngredients.includes(ingredient) }">
              <span v-if="selectedIngredients.includes(ingredient)" class="checkmark">✓</span>
            </div>
            <span class="filter-label">{{ ingredient }}</span>
          </div>
        </div>
        
        <div class="filter-actions">
          <button class="reset-filters" @click="$emit('reset')">
            <img src="/src/public/krest.png" alt="Сбросить" class="reset-icon" />
          </button>
          <button class="apply-filters" @click="$emit('apply')">Применить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  ingredients: string[]
  selectedIngredients: string[]
}>()

defineEmits<{
  close: []
  apply: []
  reset: []
  toggleIngredient: [ingredient: string]
}>()
</script>

<style scoped>
.filter-overlay {
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

.filter-modal {
  position: relative;
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 40px;
  animation: slideIn 0.3s ease;
}

.filter-modal::-webkit-scrollbar {
  width: 8px;
}

.filter-modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.filter-modal::-webkit-scrollbar-thumb {
  background: #E9544E;
  border-radius: 10px;
}

.close-filter {
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

.close-filter:hover {
  color: #E9544E;
  transform: scale(1.1);
  background-color: rgba(233, 84, 78, 0.1);
}

.filter-content {
  text-align: center;
}

.filter-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.filter-option:hover {
  background-color: rgba(233, 84, 78, 0.1);
}

.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkbox.checked {
  background-color: #E9544E;
  border-color: #E9544E;
}

.checkmark {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.filter-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  color: #333;
}

.filter-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
}

.reset-filters {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.reset-filters:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.05);
}

.reset-icon {
  width: 24px;
  height: 24px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.reset-filters:hover .reset-icon {
  opacity: 1;
}

.apply-filters {
  background: #E9544E;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 18px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-filters:hover {
  background: #d43f39;
  transform: scale(1.02);
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

@media (max-width: 768px) {
  .filter-modal {
    padding: 30px 25px;
  }
  
  .filter-title {
    font-size: 24px;
  }
  
  .filter-label {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .filter-modal {
    padding: 25px 20px;
  }
  
  .filter-title {
    font-size: 20px;
  }
  
  .filter-label {
    font-size: 14px;
  }
  
  .checkbox {
    width: 20px;
    height: 20px;
  }
  
  .apply-filters {
    padding: 10px 25px;
    font-size: 16px;
  }
  
  .reset-icon {
    width: 20px;
    height: 20px;
  }
}
</style>