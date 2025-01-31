<template>
  <div class="panorama-overlay" v-if="isVisible" @click.self="close">
    <div class="panorama-container">
      <button class="close-btn" @click="close">×</button>
      <div ref="viewerContainer" class="viewer-container"></div>
      <div v-if="isLoading" class="loading-message">加载中...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="show360Icon" class="icon-360"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const props = defineProps({
  isVisible: Boolean,
  panoramaPath: String
});

const emit = defineEmits(['close']);
const viewerContainer = ref(null);
const isLoading = ref(false);
const error = ref(null);
const show360Icon = ref(false);

let scene, camera, renderer, controls, animationFrameId;

const cleanup = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  if (controls) {
    controls.dispose();
  }
  if (renderer) {
    renderer.dispose();
    if (viewerContainer.value && viewerContainer.value.contains(renderer.domElement)) {
      viewerContainer.value.removeChild(renderer.domElement);
    }
  }
  scene = null;
  camera = null;
  renderer = null;
  controls = null;
  error.value = null;
};

const initPanorama = async () => {
  if (!viewerContainer.value) return;
  
  cleanup();
  isLoading.value = true;
  error.value = null;
  
  try {
    console.log('Initializing panorama with path:', props.panoramaPath);

    // 创建场景
    scene = new THREE.Scene();
    
    // 获取容器的实际尺寸
    const containerWidth = viewerContainer.value.clientWidth;
    const containerHeight = viewerContainer.value.clientHeight;
    
    // 使用容器的实际尺寸设置相机
    camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // 设置渲染器尺寸为容器尺寸的90%
    const renderWidth = containerWidth * 0.9;
    const renderHeight = containerHeight * 0.9;
    renderer.setSize(renderWidth, renderHeight);
    
    // 居中放置渲染器的canvas
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '50%';
    renderer.domElement.style.top = '50%';
    renderer.domElement.style.transform = 'translate(-50%, -50%)';
    
    viewerContainer.value.appendChild(renderer.domElement);

    // 创建全景图
    const textureLoader = new THREE.TextureLoader();
    console.log('Loading texture...');
    
    const texture = await new Promise((resolve, reject) => {
      textureLoader.load(
        props.panoramaPath,
        (loadedTexture) => {
          console.log('Texture loaded successfully');
          resolve(loadedTexture);
        },
        (progress) => {
          console.log('Loading progress:', progress);
        },
        (err) => {
          console.error('Texture loading error:', err);
          reject(new Error('Failed to load panorama texture'));
        }
      );
    });

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    // 确保球体朝内
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide // 添加这行以确保两面都可见
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // 设置相机和控制器
    camera.position.set(0, 0, 0.1);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;

    // 动画循环
    const animate = () => {
      if (!scene || !camera || !renderer) return;
      animationFrameId = requestAnimationFrame(animate);
      controls?.update();
      renderer.render(scene, camera);
    };
    animate();

    // 移动到这里，在加载完成后再显示360图标
    isLoading.value = false;
    show360Icon.value = true;
    setTimeout(() => {
      show360Icon.value = false;
    }, 3000);

  } catch (err) {
    console.error('Error in initPanorama:', err);
    error.value = err.message;
    isLoading.value = false;
  }
};

// 修改窗口大小处理函数
const handleResize = () => {
  if (!camera || !renderer || !viewerContainer.value) return;
  
  const containerWidth = viewerContainer.value.clientWidth;
  const containerHeight = viewerContainer.value.clientHeight;
  
  const renderWidth = containerWidth * 0.9;
  const renderHeight = containerHeight * 0.9;
  
  camera.aspect = renderWidth / renderHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(renderWidth, renderHeight);
};

// 监听可见性和路径变化
watch([() => props.isVisible, () => props.panoramaPath], ([newVisible, newPath]) => {
  if (newVisible && newPath) {
    console.log('Visibility or path changed. New path:', newPath);
    nextTick(() => {
      initPanorama();
    });
  } else if (!newVisible) {
    cleanup();
  }
}, { immediate: true });

onMounted(() => {
  window.addEventListener('resize', handleResize);
  if (props.isVisible && props.panoramaPath) {
    initPanorama();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  cleanup();
});

const close = () => {
  cleanup();
  emit('close');
};
</script>

<style scoped>
.panorama-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 150px 380px 150px 380px;
  box-sizing: border-box;
}

.panorama-container {
  position: relative;
  width: 100%;
  height: 1000px;
  background: #ffffff99;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  color: #666;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1001;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  color: #333;
}

.viewer-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 20px;
  border-radius: 8px;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: red;
  font-size: 16px;
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.icon-360 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background-image: url('../360pic/R.png');
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.8;
  animation: fadeOut 3s forwards;
  pointer-events: none;
  z-index: 1002;
}

@keyframes fadeOut {
  0% { opacity: 0.8; }
  70% { opacity: 0.8; }
  100% { opacity: 0; }
}
</style> 