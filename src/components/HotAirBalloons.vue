<template>
  <div ref="balloonContainer"></div>
</template>

<script>
import * as THREE from 'three';

export default {
  name: 'HotAirBalloons',
  props: {
    scene: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      balloons: [],
      isActive: true
    }
  },
  mounted() {
    this.initBalloons();
    this.animate();
  },
  beforeUnmount() {
    this.isActive = false;
    // 清理场景中的热气球
    this.balloons.forEach(balloon => {
      this.scene.three.remove(balloon.mesh);
    });
  },
  methods: {
    createHotAirBalloon() {
      const balloonGroup = new THREE.Group();
      
      // 创建气球主体（上半球）
      const balloonGeometry = new THREE.SphereGeometry(3, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7);
      const balloonMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFF4BD,
        roughness: 0.4,
        metalness: 0.1
      });
      const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
      balloonGroup.add(balloon);

      // 创建篮子
      const basketGeometry = new THREE.BoxGeometry(1.5, 1, 1.5);
      const basketMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8
      });
      const basket = new THREE.Mesh(basketGeometry, basketMaterial);
      basket.position.y = -4.5;
      balloonGroup.add(basket);

      // 创建连接绳索
      const ropePositions = [
        [-0.7, 0, -0.7],
        [0.7, 0, -0.7],
        [-0.7, 0, 0.7],
        [0.7, 0, 0.7]
      ];

      ropePositions.forEach(pos => {
        const ropeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 8);
        const ropeMaterial = new THREE.MeshStandardMaterial({
          color: 0x463E3F,
          roughness: 0.8
        });
        const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
        rope.position.set(pos[0], -2.5, pos[2]);
        balloonGroup.add(rope);
      });
      
      return balloonGroup;
    },

    initBalloons() {
      const numBalloons = 3;

      for (let i = 0; i < numBalloons; i++) {
        const balloon = this.createHotAirBalloon();
        
        balloon.position.set(
          Math.random() * 180 - 100,
          50 + Math.random() * 20,
          Math.random() * 180 - 100
        );
        
        const scale = 0.8 + Math.random() * 2;
        balloon.scale.set(scale, scale, scale);
        
        this.balloons.push({
          mesh: balloon,
          speed: 0.025 + Math.random() * 0.05,
          direction: new THREE.Vector3(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
          ).normalize(),
          initialY: balloon.position.y,
          floatOffset: Math.random() * Math.PI * 2
        });
        
        this.scene.three.add(balloon);
      }
    },

    updateBalloons() {
      const time = Date.now() * 0.001;
      
      this.balloons.forEach(balloon => {
        balloon.mesh.position.x += balloon.direction.x * balloon.speed;
        balloon.mesh.position.z += balloon.direction.z * balloon.speed;
        
        balloon.mesh.position.y = balloon.initialY + Math.sin(time + balloon.floatOffset) * 0.5;
        balloon.mesh.rotation.y = Math.sin(time * 0.5 + balloon.floatOffset) * 0.1;
        
        const boundary = 100;
        if (balloon.mesh.position.x > boundary) balloon.mesh.position.x = -boundary;
        if (balloon.mesh.position.x < -boundary) balloon.mesh.position.x = boundary;
        if (balloon.mesh.position.z > boundary) balloon.mesh.position.z = -boundary;
        if (balloon.mesh.position.z < -boundary) balloon.mesh.position.z = boundary;
      });
    },

    animate() {
      if (!this.isActive) return;
      
      this.updateBalloons();
      requestAnimationFrame(this.animate);
    }
  }
}
</script> 