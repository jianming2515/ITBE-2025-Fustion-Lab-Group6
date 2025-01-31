<template>
  <div class="sidebar">
    <!-- Logo 和名称部分 -->
    <div class="sidebar-header">
      <img :src="'/pic/logo.png'" class="sidebar-logo" alt="Logo">
      <div class="sidebar-name">CO-LIVING COMMUNITY</div>
    </div>

    <!-- 修改后的导航按钮 -->
    <nav class="sidebar-nav">
      <!-- 每个模式及其子菜单 -->
      <div v-for="(mode, modeIndex) in modes" :key="modeIndex" class="mode-section">
        <button 
          class="mode-button"
          :class="{ active: activeModeIndex === modeIndex }"
          @click="toggleMode(modeIndex)"
        >
          {{ mode.name }}
          <span class="arrow" :class="{ rotated: activeModeIndex === modeIndex }">▼</span>
        </button>

        <!-- 子菜单，使用 transition 实现展开/收起动画 -->
        <transition name="expand">
          <div v-show="activeModeIndex === modeIndex" class="sub-menu">
            <button 
              v-for="(item, index) in mode.items" 
              :key="index"
              class="nav-button"
              :class="{ active: activeSubIndex === index && activeModeIndex === modeIndex }"
              @click="handleItemClick(modeIndex, index)"
            >
              {{ item.name }}
            </button>
          </div>
        </transition>
      </div>
    </nav>
    <div class="sidebar-bottom">
      <div class="bottom-line" />
      <div class="bottom-text">TUM ITBE</div>
      <br>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeModeIndex = ref(0)
const activeSubIndex = ref(0)
const isSustainabilityActive = ref(false)

// 定义所有模式及其子菜单
const modes = [
  {
    name: 'Project Mode',
    items: [
      { name: 'Project Introduction' },
      { name: 'Design Concept' },
      { name: 'Functionality' },
      { name: 'Virtual Tour' },
      { name: 'Sustainability' },
      { name: 'Public Space & Activities' },
      { name: 'Message Board' },
      { name: 'About' },
    ]
  },
  {
    name: 'City Mode',
    items: [
      { name: 'City Overview' },
      { name: 'Transportation' },
      { name: 'Demographics' },
      { name: 'Urban Analysis' }
    ]
  },
  {
    name: 'IFC Mode',
    items: [
      { name: 'Model Viewer' },
      { name: 'Properties' },
      { name: 'Analysis' },
      { name: 'Export' }
    ]
  }
]

const emit = defineEmits(['showAbout', 'menuClick', 'modeChange'])

// 修改模式切换逻辑
const toggleMode = (modeIndex) => {
  activeModeIndex.value = activeModeIndex.value === modeIndex ? null : modeIndex
  activeSubIndex.value = 0
  
  // 获取当前模式名称
  const modeName = modeIndex !== null ? modes[modeIndex].name : null
  
  // 触发模式切换
  if (modeName) {
    window.switchMode(modeName)
  }
  
  emit('modeChange', modeName)
}

// 统一处理所有模式的点击事件
const handleItemClick = (modeIndex, index) => {
  activeSubIndex.value = index
  const item = modes[modeIndex].items[index]
  
  if (modeIndex === 0) { // Project Mode
    if (item.name !== 'Sustainability' && isSustainabilityActive.value) {
      window.resetHighlights?.()
      isSustainabilityActive.value = false
    }
    if (item.name === 'About') {
      emit('showAbout')
    } else if (item.name === 'Sustainability') {
      isSustainabilityActive.value = true
      window.highlightSustainableElements?.()
    }
  }
  
  emit('menuClick', item.name)
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 1vh;
  top: 2.5vh;
  width: 300px;
  height: 92vh;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 100;
  border-radius: 15px;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  border-bottom: 1.5px solid #a5a5a5;
}

.sidebar-logo {
  width: 55px;
  height: 55px;
  margin-bottom: 20px;
}

.sidebar-name {
  font-family: 'Poppins', 'Nunito Sans', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: #000000;
  text-align: center;
  letter-spacing: 0.1em;
}

.sidebar-nav {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

/* 模式部分容器 */
.mode-section {
  width: 100%;
  margin-bottom: 12px;
}

/* 主模式按钮样式 */
.mode-button {
  width: 90%;
  padding: 12px 20px;
  border: none;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #555;
  font-family: 'Poppins', 'Nunito Sans', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.mode-button:hover {
  background: rgba(255, 255, 255, 0.8);
}

.mode-button.active {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 箭头样式 */
.arrow {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.arrow.rotated {
  transform: rotate(-180deg);
}

/* 子菜单样式 */
.sub-menu {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  margin: 8px auto;
  padding: 8px;
  width: 85%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 子菜单按钮样式 */
.nav-button {
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: transparent;
  color: #555;
  font-family: 'Poppins', 'Nunito Sans', system-ui, sans-serif;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 2px 0;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.5);
}

.nav-button.active {
  background: rgba(255, 255, 255, 0.8);
  color: #333;
}

/* 展开/收起动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px; /* 根据实际内容调整 */
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin: 0;
  padding: 0;
}

.sidebar-bottom {
  margin-top: auto;
  text-align: center;
}

.bottom-line {
  display: flex;
  flex-direction: column;
  align-items: center;

  border-bottom: 1.5px solid #bdbcbc;
 margin: 20px 0;
}

.bottom-text {
  font-family: 'Poppins', 'Nunito Sans', system-ui, sans-serif;
  font-size: 0.85rem;
  color: #8d8d8d;
  margin:0px 0;
  
}
</style> 