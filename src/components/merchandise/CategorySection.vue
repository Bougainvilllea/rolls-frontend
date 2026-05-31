<template>
  <div class="category-section" :id="category.slug">
    <div class="category-header">
      <h2 class="category-title">{{ category.name.toUpperCase() }}</h2>
      <img src="/src/public/lin.png" alt="underline" class="category-underline" />
    </div>
    
    <div class="merchandise-grid" v-if="category.merchandises && category.merchandises.length > 0">
      <MerchandiseCard 
        v-for="item in category.merchandises" 
        :key="item.id"
        :merchandise="item"
        :cartQuantities="cartQuantities"
        @addToCart="handleAddToCart"
      />
    </div>
    <div v-else class="empty-category">
      <p>Товары в этой категории скоро появятся</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import MerchandiseCard from './MerchandiseCard.vue'

const props = defineProps<{
  category: any
  cartQuantities: Record<string, number>
}>()

const emit = defineEmits<{
  addToCart: [merchandiseId: number, variationId: number, quantity: number]
}>()

const handleAddToCart = (merchandiseId: number, variationId: number, quantity: number) => {
  emit('addToCart', merchandiseId, variationId, quantity)
}
</script>

<style scoped>
.category-section {
  margin-bottom: 60px;
  scroll-margin-top: 100px;
}

.category-header {
  text-align: center;
  margin-bottom: 30px;
}

.category-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 32px;
  font-weight: 800;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.category-underline {
  display: block;
  margin: 0 auto;
  width: 150px;
  height: auto;
}

.merchandise-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.empty-category {
  text-align: center;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 20px;
  font-family: 'Courier New', Courier, monospace;
  color: #999;
}

@media (max-width: 900px) {
  .merchandise-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .category-title {
    font-size: 28px;
  }
}

@media (max-width: 550px) {
  .merchandise-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .category-title {
    font-size: 24px;
  }
}
</style>