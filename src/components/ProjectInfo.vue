<template>
  <div class="project-info" v-if="isVisible">
    <div class="info-header">
      <h2>Project Introduction</h2>
    </div>
    <div class="info-content">
      <p>This is a modern co-living community project...</p>
      <!-- 添加项目介绍内容 -->
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
.project-info {
  position: fixed;
  right: 1vh;
  top: 2.5vh;
  width: 2100px; /* 更宽的宽度 */
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
  margin-left: 10px; /* 与sidebar的间距 */
  animation: slideIn 0.3s ease-out;
}

/* 其他样式与 SustainabilityInfo 相同 */
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