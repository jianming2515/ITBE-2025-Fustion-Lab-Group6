<template>
  <div class="music-control">
    <button @click="toggleMute" class="mute-button">
      <span v-if="isMuted">🔇</span> <!-- 静音图标 -->
      <span v-else>🔊</span> <!-- 音量图标 -->
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      audio: null,
      isMuted: false,
      fadeInterval: null
    };
  },
  mounted() {
    this.audio = new Audio('/music/city-pop-style-seamless-looping-background-musicrelax-and-happynot-too-excited_012025.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.3; // 设置初始音量为 30%
    
    // 监听用户交互事件
    const startAudio = () => {
      this.fadeIn();
      document.removeEventListener('click', startAudio);
    };
    
    // 尝试自动播放
    this.audio.play().then(() => {
      this.fadeIn();
    }).catch(() => {
      // 如果自动播放失败，等待用户第一次点击
      document.addEventListener('click', startAudio);
    });
  },
  methods: {
    fadeIn(duration = 2000) {
      if (this.fadeInterval) clearInterval(this.fadeInterval);
      this.audio.volume = 0;
      this.audio.play();
      
      const steps = 20;
      const increment = 0.3 / steps;
      const interval = duration / steps;
      
      this.fadeInterval = setInterval(() => {
        if (this.audio.volume < 0.3) {
          this.audio.volume = Math.min(0.3, this.audio.volume + increment);
        } else {
          clearInterval(this.fadeInterval);
        }
      }, interval);
    },
    fadeOut(duration = 2000) {
      if (this.fadeInterval) clearInterval(this.fadeInterval);
      
      const steps = 20;
      const decrement = this.audio.volume / steps;
      const interval = duration / steps;
      
      this.fadeInterval = setInterval(() => {
        if (this.audio.volume > 0) {
          this.audio.volume = Math.max(0, this.audio.volume - decrement);
        } else {
          clearInterval(this.fadeInterval);
          this.audio.pause();
        }
      }, interval);
    },
    toggleMute() {
      if (this.isMuted) {
        this.fadeIn();
      } else {
        this.fadeOut();
      }
      this.isMuted = !this.isMuted;
    },
  },
  beforeUnmount() {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.fadeOut(1000);
    setTimeout(() => {
      this.audio = null;
    }, 1000);
  }
};
</script>

<style scoped>
.music-control {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.mute-button {
  position: relative;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none; /* 去掉按钮描边 */
  cursor: pointer; /* 鼠标悬停时显示为手型 */
  font-size: 20px; /* 增加字体大小以确保图标清晰可见 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.mute-button:hover {
  background-color: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}
</style> 