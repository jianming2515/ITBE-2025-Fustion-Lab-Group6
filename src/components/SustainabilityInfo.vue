<template>
  <div class="sustainability-info" v-if="isVisible">
    <div class="info-header">
      <h2>Sustainability Information</h2>
    </div>
    <div class="info-content">
      <p>This building incorporates several sustainable features:</p>
      <ul>
        <li>Green roof system</li>
        <li>Solar panels</li>
        <li>Rainwater harvesting</li>
        <li>Natural ventilation</li>
        <li>High-performance insulation</li>
      </ul>
      <p>The highlighted elements in red show the key sustainable components of the building.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.sustainability-info {
  position: fixed;
  right: 1vh;
  top: 2.5vh;
  width: 300px;
  height: 92vh;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  padding: 20px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  border-radius: 15px;
  animation: slideIn 0.3s ease-out;
}

.info-header {
  padding: 20px 0;
  border-bottom: 1.5px solid #a5a5a5;
}

.info-header h2 {
  font-family: 'Poppins', 'Nunito Sans', system-ui, sans-serif;
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  text-align: center;
}

.info-content {
  padding: 20px 0;
  font-family: 'Poppins', 'Nunito Sans', system-ui, sans-serif;
  color: #666;
}

.info-content ul {
  padding-left: 20px;
  margin: 15px 0;
}

.info-content li {
  margin: 10px 0;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 