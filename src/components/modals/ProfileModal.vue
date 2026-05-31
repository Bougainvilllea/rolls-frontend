<template>
  <div v-if="isOpen && user" class="profile-overlay" @click.self="$emit('close')">
    <div class="profile-modal">
      <div class="profile-content">
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-circle">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <h2 class="profile-name">{{ user.name }}</h2>
          <button class="logout-btn" @click="$emit('logout')">Выйти</button>
        </div>

        <div class="profile-info">
          <h3>Информация профиля</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Имя:</span>
              <span class="info-value">{{ user.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Логин:</span>
              <span class="info-value">{{ user.username }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Телефон:</span>
              <span class="info-value">{{ user.phone }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Дата регистрации:</span>
              <span class="info-value">{{ user.registeredAt }}</span>
            </div>
          </div>
        </div>

        <div class="profile-orders">
          <h3>История заказов</h3>
          <div v-if="orders.length > 0" class="orders-list">
            <div v-for="order in orders" :key="order.id" class="order-card">
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
  </div>
</template>

<script setup lang="ts">
const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    'Доставлен': 'delivered',
    'В обработке': 'in-progress',
    'Отменен': 'cancelled'
  }
  return statusMap[status] || ''
}

defineProps<{
  isOpen: boolean
  user: any
  orders: any[]
}>()

defineEmits<{
  close: []
  logout: []
}>()
</script>

<style scoped>
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

@media (max-width: 768px) {
  .profile-content {
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
}

@media (max-width: 480px) {
  .avatar-circle {
    width: 70px;
    height: 70px;
    font-size: 32px;
  }
  
  .profile-name {
    font-size: 20px;
  }
  
  .profile-info h3, .profile-orders h3 {
    font-size: 20px;
  }
  
  .info-value {
    font-size: 16px;
  }
}
</style>