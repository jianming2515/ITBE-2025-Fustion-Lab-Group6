<template>
  <LoadingScreen 
    v-if="isLoading" 
    @loading-complete="handleLoadingComplete"
  />
  <Sidebar 
    v-show="!isLoading" 
    @showAbout="showAbout"
    @menuClick="handleMenuClick"  
  />
  <About :isVisible="isAboutVisible" @close="hideAbout" />
  <SustainabilityInfo :isVisible="isSustainabilityVisible" />
  <ProjectInfo :isVisible="isProjectVisible" />
  <DesignInfo :isVisible="isDesignVisible" />
  <CubeInfo 
    :isVisible="isCubeInfoVisible" 
    :cubeData="cubeData" 
    @close="hideCubeInfo" 
  />
  <PanoramaViewer 
    v-if="isPanoramaVisible"
    :isVisible="isPanoramaVisible"
    :panoramaPath="currentPanoramaPath"
    @close="hidePanorama"
  />
  <MusicControl />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoadingScreen from './components/LoadingScreen.vue'
import Sidebar from './components/Sidebar.vue'
import About from './components/About.vue'
import SustainabilityInfo from './components/SustainabilityInfo.vue'
import CubeInfo from './components/CubeInfo.vue'
import MusicControl from './components/MusicControl.vue'
import PanoramaViewer from './components/PanoramaViewer.vue'
import ProjectInfo from './components/ProjectInfo.vue'
import DesignInfo from './components/DesignInfo.vue'

const isLoading = ref(true)
const isAboutVisible = ref(false)
const isSustainabilityVisible = ref(false)
const isCubeInfoVisible = ref(false)
const isPanoramaVisible = ref(false)
const currentPanoramaPath = ref('')
const cubeData = ref(null)
const isProjectVisible = ref(false)
const isDesignVisible = ref(false)

const handleLoadingComplete = () => {
  if (!isLoading.value) return
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

const showAbout = () => {
  isAboutVisible.value = true
}

const hideAbout = () => {
  isAboutVisible.value = false
}

const hidePins = () => {
  window.hideVirtualTourPins?.()
}

const handleMenuClick = (menuName) => {
  isProjectVisible.value = false
  isDesignVisible.value = false
  isSustainabilityVisible.value = false
  
  if (menuName === 'Virtual Tour') {
    window.startVirtualTour?.()
  } else if (menuName === 'Sustainability') {
    isSustainabilityVisible.value = true
  } else if (menuName === 'Project Introduction') {
    isProjectVisible.value = true
  } else if (menuName === 'Design Concept') {
    isDesignVisible.value = true
  } else {
    hidePins()
  }
}

const showCubeInfo = (data) => {
  cubeData.value = data
  isCubeInfoVisible.value = true
}

const hideCubeInfo = () => {
  isCubeInfoVisible.value = false
}

const showPanorama = (path) => {
  currentPanoramaPath.value = path
  isPanoramaVisible.value = true
}

const hidePanorama = () => {
  isPanoramaVisible.value = false
  currentPanoramaPath.value = ''
}

onMounted(() => {
  // 将 showPanorama 函数暴露给全局
  window.showPanorama = showPanorama
})

</script> 