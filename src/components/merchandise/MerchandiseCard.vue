<template>
  <div class="merchandise-card">
    <h3 class="card-title">{{ merchandise.name }}</h3>
    
    <div class="card-image">
      <img 
        :src="getImageUrl(merchandise.image)" 
        :alt="merchandise.name"
        @error="handleImageError"
      />
    </div>
    
    <p class="card-description">{{ merchandise.description }}</p>
    
    <div class="variations">
      <div 
        v-for="variation in merchandise.variations" 
        :key="variation.id"
        class="variation-option"
        :class="{ active: selectedVariationId === variation.id }"
        @click="selectVariation(variation.id)"
      >
        <div class="variation-dot"></div>
        <span class="variation-text">
          {{ variation.variation_text }} / {{ variation.weight_gram }} г.
        </span>
        <span class="variation-price">{{ variation.price }} р.</span>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="quantity-control" v-if="getQuantityInCart() > 0">
        <button class="quantity-btn" @click="decrementQuantity">
          <img src="/src/public/mn.png" alt="-" />
        </button>
        <span class="quantity-number">{{ getQuantityInCart() }}</span>
        <button class="quantity-btn" @click="incrementQuantity">
          <img src="/src/public/pl.png" alt="+" />
        </button>
      </div>
      <button v-else class="add-to-cart-btn" @click="addToCart">
        <img src="/src/public/plus.png" alt="+" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Variation {
  id: number
  merchandise_id: number
  quantity: number
  price: number
  variation_text: string
  weight_gram: number
}

interface Merchandise {
  id: number
  category_id: number
  name: string
  description: string
  image: string
  variations: Variation[]
}

const props = defineProps<{
  merchandise: Merchandise
  cartQuantities: Record<string, number>
}>()

const emit = defineEmits<{
  addToCart: [merchandiseId: number, variationId: number, quantity: number]
  removeFromCart: [merchandiseId: number, variationId: number]
}>()

const selectedVariationId = ref<number>(props.merchandise.variations[0]?.id || 0)

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/src/public/hap.png'
  return `http://172.24.156.131:8000/${imagePath}`
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/src/public/hap.png'
}

const selectVariation = (id: number) => {
  selectedVariationId.value = id
}

const getQuantityInCart = () => {
  const key = `${props.merchandise.id}_${selectedVariationId.value}`
  return props.cartQuantities[key] || 0
}

const addToCart = () => {
  emit('addToCart', props.merchandise.id, selectedVariationId.value, 1)
}

const incrementQuantity = () => {
  emit('addToCart', props.merchandise.id, selectedVariationId.value, 1)
}

const decrementQuantity = () => {
  emit('addToCart', props.merchandise.id, selectedVariationId.value, -1)
}
</script>

<style scoped>
.merchandise-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.merchandise-card:hover {
  transform: translateY(-5px);
}

.card-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  font-weight: 800;
  color: #333;
  text-align: center;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-image {
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 15px;
  border-radius: 12px;
  overflow: hidden;
  background: #f9f9f9;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-description {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #666;
  text-align: center;
  margin-bottom: 15px;
  line-height: 1.4;
}

.variations {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.variation-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.variation-option:hover {
  border-color: #E9544E;
  background: rgba(233, 84, 78, 0.05);
}

.variation-option.active {
  border-color: #E9544E;
  background: rgba(233, 84, 78, 0.1);
}

.variation-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ccc;
  transition: all 0.3s ease;
}

.variation-option.active .variation-dot {
  background: #E9544E;
  box-shadow: 0 0 0 3px rgba(233, 84, 78, 0.2);
}

.variation-text {
  flex: 1;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.variation-price {
  font-family: 'Courier New', Courier, monospace;
  font-size: 15px;
  font-weight: 800;
  color: #E9544E;
}

.card-footer {
  display: flex;
  justify-content: center;
  margin-top: auto;
}

.add-to-cart-btn {
  width: 50px;
  height: 50px;
  background: #E9544E;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  background: #d43f39;
  transform: scale(1.05);
}

.add-to-cart-btn img {
  width: 24px;
  height: 24px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f5f5f5;
  padding: 8px 15px;
  border-radius: 40px;
}

.quantity-btn {
  width: 34px;
  height: 34px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 17px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quantity-btn:hover {
  background: #E9544E;
  border-color: #E9544E;
}

.quantity-btn img {
  width: 16px;
  height: 16px;
}

.quantity-btn:hover img {
  filter: brightness(0) invert(1);
}

.quantity-number {
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  min-width: 30px;
  text-align: center;
}
</style>