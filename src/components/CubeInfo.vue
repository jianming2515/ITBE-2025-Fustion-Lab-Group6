<template>
  <div class="cube-info" v-if="isVisible" :style="positionStyle">
    <div class="info-header">
      <h2>{{ cubeData?.title }}</h2>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    <div class="info-content">
      <p>{{ cubeData?.description }}</p>
      <div class="details">
        <div v-for="(detail, index) in cubeData?.details" :key="index" class="detail-item">
          <span class="label">{{ detail.label }}:</span>
          <span class="value">{{ detail.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isVisible: Boolean,
  cubeData: Object,
})

const positionStyle = computed(() => {
  if (!props.cubeData?.position) return {}
  
  const x = (props.cubeData.position.x / 2 + 0.5) * window.innerWidth
  const y = (-props.cubeData.position.y / 2 + 0.5) * window.innerHeight
  
  return {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)'
  }
})

defineEmits(['close'])
</script>

<style scoped>
.cube-info {
  width: 300px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  border-radius: 15px;
  padding: 20px;
  z-index: 1000;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1.5px solid #a5a5a5;
}

.info-header h2 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 1.2rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0 5px;
}

.info-content {
  padding-top: 15px;
  font-family: 'Poppins', sans-serif;
}

.info-content p {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.5;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
}
</style> 