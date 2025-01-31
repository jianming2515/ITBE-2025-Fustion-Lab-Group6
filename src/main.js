import { createApp, ssrContextKey } from 'vue'
import App from './App.vue'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import * as TWEEN from '@tweenjs/tween.js'
import * as OBC from "@thatopen/components";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import * as WEBIFC from './web-ifc-api.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Cesium from 'cesium';


// 创建 Vue 应用
const app = createApp(App)
app.mount('#app')

// 在挂载之前设置全局属性
window.__vue_app__ = app

// get the viewer container from the html document
const container = document.getElementById("viewerContainer");

// check if the viewer container is found in the html file.
//const container = viewerContainer;
if (!container) {
  throw new Error("HTML container element not found!");
}

// create a new instance of the ThatOpenCompany components class and initialize it.
const components = new OBC.Components();
components.init();

// create a new world component.
const worlds = components.get(OBC.Worlds);
const world = worlds.create();

// create a new scene, renderer and camera component (very similar to the three.js concepts).
const scene = world.scene = new OBC.SimpleScene(components);


scene.setup();
scene.config.ambientLight.intensity = 1;
scene.config.ambientLight.color = new THREE.Color(0xffffff);


//create renderer
const renderer = world.renderer = new OBC.SimpleRenderer(components, container,
  {  antialias: true,  // 开启抗锯齿
  alpha: true,
  powerPreference: "high-performance",
  precision: "highp",  // 使用高精度渲染
  });


//create camera
const camera = world.camera = new OBC.OrthoPerspectiveCamera(components);

  // 设置为投影模式
  // camera.projection.set('Orthographic');
  camera.projection.set('Perspective');
  camera.three.far = 3000;
  camera.three.fov = 55;

  // set the defailt camera position
  camera.controls.setLookAt(-100, 30, -20, 25, 0, -50);
  camera.controls.maxPolarAngle = Math.PI / 2;

//first person mode
//   const navigation = new OBC.FirstPersonMode(camera);
//   navigation.set(true);

//load environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load( './textures/equirectangular/sky/Anime Sky HDRI Plus/04.hdr', ( environmentMap ) => {

    environmentMap.mapping = THREE.EquirectangularReflectionMapping;

    scene.three.background = environmentMap;
    scene.three.backgroundBlurriness = 0;
    scene.three.environment = environmentMap;
    

} );

//lights
const directionalLight = new THREE.DirectionalLight( '#ffffff',2 );
directionalLight.position.set( 6.25, 3, 4 );
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set( 1024, 1024 );
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = - 8;
directionalLight.shadow.camera.left = - 8;
directionalLight.shadow.normalBias = 0.05;
directionalLight.shadow.bias = 0;
scene.three.add(directionalLight);

//fog
scene.three.fog = new THREE.FogExp2(0xeeeeee, 0.0025)



// create a new fragment manager and ifc loader component.
const fragments = new OBC.FragmentsManager(components);
let loadedModel; // 声明一个变量来存储加载的模型

try {
  const file = await fetch("./model/bim.frag");
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  loadedModel = fragments.load(buffer);

  // 计算模型的边界框
  const box = new THREE.Box3().setFromObject(loadedModel);
  const center = box.getCenter(new THREE.Vector3());

  // 设置模型位置和缩放
  loadedModel.position.set(1.8, 15.6, -10.6);
  loadedModel.rotation.set(0, 5.825, 0);
  loadedModel.scale.set(0.24, 0.24, 0.24);

  world.scene.three.add(loadedModel);
  console.log("Model loaded successfully");
} catch (error) {
  console.error("Error loading model:", error);
}

// 创建一个函数来处理筛选和颜色变化
const highlightSustainableElements = () => {
  if (!loadedModel) {
    console.error("Model not loaded");
    return;
  }
  const classifier = components.get(OBC.Classifier);
  classifier.byEntity(loadedModel);
  const walls = classifier.find({
    entities: ["IFCWALLSTANDARDCASE"],
  });
  classifier.setColor(walls, new THREE.Color("#4db15a"));
};

// 创建一个函数来重置颜色
const resetHighlights = () => {
  if (!loadedModel) return;
  const classifier = components.get(OBC.Classifier);
  classifier.byEntity(loadedModel);
  const walls = classifier.find({
    entities: ["IFCWALLSTANDARDCASE"],
  });
  
  classifier.resetColor(walls);
};

// 将函数暴露给全局，以便从 Sidebar 组件调用
window.highlightSustainableElements = highlightSustainableElements;
window.resetHighlights = resetHighlights;

//load site model
const loader = new GLTFLoader()
loader.load('./model/site.gltf', (gltf) => {
  // 计算模型的边界框
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());

  // 将模型的中心位置设置为原点
  gltf.scene.position.sub(center);  // 调整位置，使中心位于原点
  gltf.scene.position.y += 9;  // x轴方向偏移5个单位
  gltf.scene.position.x -= 55;  // z轴方向偏移5个单位
  
  // 获取building引用
  const building = gltf.scene.getObjectByName('building');
  
  // 创建玻璃材质
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,      // 白色
    transmission: 0.8,    // 透光度
    opacity: 0.8,         // 不透明度
    metalness: 0.1,       // 金属度
    roughness: 0.5,       // 粗糙度
    ior: 1.5,            // 折射率
    thickness: 1,       // 厚度
    transparent: true,    // 启用透明
    side: THREE.DoubleSide // 双面渲染
  });

  // 递归遍历building的所有子网格并应用材质
  building.traverse((child) => {
    if (child.isMesh) {
      child.material = glassMaterial;
    }
  });
  
  world.scene.three.add(gltf.scene);
})










// 添加一个变量来控制是否自动旋转
let isAutoRotating = true;
const rotationSpeed = 0.0002; // 调整旋转速度

// 修改 createPin 函数
const createPin = (x, y, z, label) => {
    const pinGroup = new THREE.Group();

    const pinMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            void main() {
                // 调整色相范围为 0.7-0.9，主要在粉紫色区间
                float hue = 0.7 + 0.2 * sin(vUv.y * 2.0 + time * 0.1);
                // 进一步降低饱和度，使颜色更柔和
                vec3 color = hsv2rgb(vec3(hue, 0.25, 0.95));
                // 增加白色混合比例
                color = mix(color, vec3(1.0), 0.4);
                gl_FragColor = vec4(color, 0.6);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });

    // 创建pin几何体
    const pinGeometry = new THREE.ConeGeometry(0.5, 2, 32);
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);
    pin.rotation.x = Math.PI;
    pinGroup.add(pin);

    // 创建文字标签
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    // 设置文字样式
    context.fillStyle = '#ffffff';
    context.font = 'bold 60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // 创建文字背景
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    context.roundRect(0, 0, canvas.width, canvas.height, 20);
    context.fill();
    
    // 绘制文字
    context.fillStyle = '#ffffff';
    context.fillText(label, canvas.width/2, canvas.height/2);

    // 创建精灵材质
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });

    // 创建精灵（用于显示文字）
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4, 2, 1);
    sprite.position.y = 3; // 将文字放在pin上方

    pinGroup.add(sprite);

    // 更新材质的time uniform
    function updatePinMaterial() {
        pinMaterial.uniforms.time.value = performance.now() * 0.001;
        requestAnimationFrame(updatePinMaterial);
    }
    updatePinMaterial();

    pinGroup.position.set(x, y, z);
    pinGroup.visible = false;
    
    return pinGroup;
};

// 创建三个pin，添加不同的标签
const pin1 = createPin(-18.8, 3, -12.6, 'Street');
const pin2 = createPin(1.8, 13, -2, 'Tower');
const pin3 = createPin(15.6, 8.2, -41, 'Rooftop');

// // 添加GUI控制面板
// const gui = new GUI();

// // 为每个pin创建一个文件夹
// const pin1Folder = gui.addFolder('Pin 1 位置');
// const pin2Folder = gui.addFolder('Pin 2 位置');
// const pin3Folder = gui.addFolder('Pin 3 位置');

// // 创建控制对象
// const pinControls = {
//     pin1: { x: pin1.position.x, y: pin1.position.y, z: pin1.position.z },
//     pin2: { x: pin2.position.x, y: pin2.position.y, z: pin2.position.z },
//     pin3: { x: pin3.position.x, y: pin3.position.y, z: pin3.position.z }
// };

// // 为每个pin添加控制器
// [
//     { folder: pin1Folder, pin: pin1, controls: pinControls.pin1 },
//     { folder: pin2Folder, pin: pin2, controls: pinControls.pin2 },
//     { folder: pin3Folder, pin: pin3, controls: pinControls.pin3 }
// ].forEach(({ folder, pin, controls }) => {
//     folder.add(controls, 'x', -50, 50).onChange(value => pin.position.x = value);
//     folder.add(controls, 'y', -50, 50).onChange(value => pin.position.y = value);
//     folder.add(controls, 'z', -50, 50).onChange(value => pin.position.z = value);
//     folder.open();
// });

// 将所有 pin 添加到场景中
scene.three.add(pin1);
scene.three.add(pin2);
scene.three.add(pin3);

// 添加点击事件监听
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// 修改点击事件监听
container.addEventListener('click', (event) => {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(pointer, camera.three);
    
    const pins = [pin1, pin2, pin3];
    const intersects = raycaster.intersectObjects(pins, true); // 添加 true 以检查子对象
    
    if (intersects.length > 0) {
        // 找到被点击的pin的根对象
        let clickedPin = intersects[0].object;
        while (clickedPin.parent && pins.indexOf(clickedPin) === -1) {
            clickedPin = clickedPin.parent;
        }
        
        let panoramaPath;
        
        // 根据pin分配对应的全景图路径
        if (clickedPin === pin1) {
            panoramaPath = '/360pic/1.png';
        } else if (clickedPin === pin2) {
            panoramaPath = '/360pic/2.png';
        } else if (clickedPin === pin3) {
            panoramaPath = '/360pic/3.png';
        }
        
        console.log('Clicked pin, loading panorama:', panoramaPath); // 添加调试日志
        
        // 使用 Vue 组件显示全景图
        if (window.showPanorama) {
            window.showPanorama(panoramaPath);
        } else {
            console.error('showPanorama function not found on window object');
        }
    }
});

// 创建热气球
const createHotAirBalloon = () => {
    const balloonGroup = new THREE.Group();
    
    // 创建气球主体（上半球）
    const balloonGeometry = new THREE.SphereGeometry(3, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const balloonMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFF4BD, // 浅黄色
        roughness: 0.4,
        metalness: 0.1
    });
    const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
    balloonGroup.add(balloon);

    // 创建篮子
    const basketGeometry = new THREE.BoxGeometry(1.5, 1, 1.5);
    const basketMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // 棕色
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
};

// 创建多个热气球
const balloons = [];
const numBalloons = 3;

for (let i = 0; i < numBalloons; i++) {
    const balloon = createHotAirBalloon();
    
    // 随机设置热气球的初始位置
    balloon.position.set(
        Math.random() * 180 - 100, // x: -100 到 100
        50 + Math.random() * 20,   // y: 70 到 90
        Math.random() * 180 - 100  // z: -100 到 100
    );
    
    // 随机设置热气球的大小
    const scale = 0.8 + Math.random() * 2; // 0.8 到 1.2
    balloon.scale.set(scale, scale, scale);
    
    balloons.push({
        mesh: balloon,
        speed: 0.025 + Math.random() * 0.05, // 降低速度使运动更加平缓
        direction: new THREE.Vector3(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
        ).normalize(),
        initialY: balloon.position.y,
        floatOffset: Math.random() * Math.PI * 2 // 用于创建飘浮效果
    });
    
    scene.three.add(balloon);
}

// 更新热气球的移动
const updateBalloons = () => {
    const time = Date.now() * 0.001; // 获取当前时间用于飘浮动画
    
    balloons.forEach(balloon => {
        // 水平移动
        balloon.mesh.position.x += balloon.direction.x * balloon.speed;
        balloon.mesh.position.z += balloon.direction.z * balloon.speed;
        
        // 添加上下飘浮的效果
        balloon.mesh.position.y = balloon.initialY + Math.sin(time + balloon.floatOffset) * 0.5;
        
        // 添加轻微的旋转效果
        balloon.mesh.rotation.y = Math.sin(time * 0.5 + balloon.floatOffset) * 0.1;
        
        // 检查是否超出边界，如果是则将热气球移动到对面
        const boundary = 100;
        if (balloon.mesh.position.x > boundary) balloon.mesh.position.x = -boundary;
        if (balloon.mesh.position.x < -boundary) balloon.mesh.position.x = boundary;
        if (balloon.mesh.position.z > boundary) balloon.mesh.position.z = -boundary;
        if (balloon.mesh.position.z < -boundary) balloon.mesh.position.z = boundary;
    });
};

// 添加模式状态变量
let activeModeIndex = 0;

// 将 switchMode 声明为全局函数
window.switchMode = function(mode) {
  // 重置所有 pin
  [pin1, pin2, pin3].forEach(pin => pin.visible = false);
  
  // 停止自动旋转
  isAutoRotating = false;

  switch (mode) {
    case 'Project Mode':
      activeModeIndex = 0;
      toggleSceneElements('Project Mode');
      // 重置相机位置到默认视角
      camera.controls.setLookAt(-100, 30, -20, 25, 0, -50);
      break;

    case 'City Mode':
      activeModeIndex = 1;
      break;

    case 'IFC Mode':
      activeModeIndex = 2;
      toggleSceneElements('IFC Mode');
      break;
  }
};

// 场景切换函数
const toggleSceneElements = (mode) => {
  if (!world || !world.scene) return;

  switch (mode) {
    case 'Project Mode':
      // 显示所有元素
      scene.three.background = environmentMap; // 恢复天空盒
      scene.three.fog = new THREE.FogExp2(0xeeeeee, 0.0025); // 恢复雾效果
      // 显示热气球
      balloons.forEach(balloon => {
        balloon.mesh.visible = true;
      });
      // 显示 site model
      scene.three.traverse((child) => {
        if (child.name === 'site' || child.name === 'building') {
          child.visible = true;
        }
      });
      // 隐藏 IFC 模型
      if (loadedModel) {
        loadedModel.visible = false;
      }
      break;

    case 'IFC Mode':
      // 移除天空盒
      scene.three.background = null;
      // 移除雾效果
      scene.three.fog = null;
      // 隐藏热气球
      balloons.forEach(balloon => {
        balloon.mesh.visible = false;
      });
      // 隐藏 site model
      scene.three.traverse((child) => {
        if (child.name === 'site' || child.name === 'building') {
          child.visible = false;
        }
      });
      // 显示 IFC 模型
      if (loadedModel) {
        loadedModel.visible = true;
        // 聚焦到 IFC 模型
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        
        // 设置相机位置以适应模型
        camera.controls.setLookAt(
          center.x + 50,  // 相机位置偏移
          center.y + 30,
          center.z + 50,
          center.x,       // 目标点（模型中心）
          center.y,
          center.z
        );
      }
      break;
  }
};

// 动画循环函数
function animate() {
  requestAnimationFrame(animate);
  
  // 更新 TWEEN
  TWEEN.update();
  
  // 只在 Project Mode 下更新热气球
  if (activeModeIndex === 0) {
    updateBalloons();
  }
  
  // 只在 Project Mode 且启用时进行自动旋转
  if (isAutoRotating && activeModeIndex === 0) {
    const currentPosition = world.camera.controls.getPosition();
    const target = world.camera.controls.getTarget();
    
    const angle = rotationSpeed;
    const x = currentPosition.x;
    const z = currentPosition.z;
    
    const newX = Math.cos(angle) * (x - target.x) - Math.sin(angle) * (z - target.z) + target.x;
    const newZ = Math.sin(angle) * (x - target.x) + Math.cos(angle) * (z - target.z) + target.z;
    
    world.camera.controls.setPosition(newX, currentPosition.y, newZ);
  }
  
  world.camera.controls.update();
}

// 启动动画循环
animate();

// 添加 IFC 模式下的功能处理
const handleIfcModeAction = (action) => {
  if (!loadedModel) return;

  switch (action) {
    case 'Properties':
      // 使用 OBC 的属性查看器
      const properties = components.get(OBC.FragmentProperties);
      properties.setFragment(loadedModel);
      break;

    case 'Analysis':
      // 使用 OBC 的分析工具
      const classifier = components.get(OBC.Classifier);
      classifier.byEntity(loadedModel);
      break;

    case 'Export':
      // 使用 OBC 的导出功能
      const exporter = components.get(OBC.FragmentExporter);
      exporter.export(loadedModel);
      break;
  }
};

// 将函数暴露给全局
window.handleIfcModeAction = handleIfcModeAction;

// 启动动画循环
animate();

// 修改 startVirtualTour 函数
const startVirtualTour = () => {
    // 显示所有 pin
    pin1.visible = true;
    pin2.visible = true;
    pin3.visible = true;

    // 获取当前相机位置
    const currentPos = world.camera.controls.getPosition();
    
    // 计算目标位置
    const targetX = currentPos.x * 0.5;
    const targetY = currentPos.y * 0.5;
    const targetZ = currentPos.z * 0.5;

    // 动画持续时间（毫秒）
    const duration = 2000;
    const startTime = Date.now();

    // 创建动画函数
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用 easeInOutCubic 缓动函数
        const easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // 计算当前位置
        const x = currentPos.x + (targetX - currentPos.x) * easeProgress;
        const y = currentPos.y + (targetY - currentPos.y) * easeProgress;
        const z = currentPos.z + (targetZ - currentPos.z) * easeProgress;

        // 更新相机位置
        world.camera.controls.setPosition(x, y, z);
        world.camera.controls.update();

        // 如果动画未完成，继续下一帧
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }

    // 开始动画
    animateCamera();
};

// 添加隐藏pins的函数
const hideVirtualTourPins = () => {
    pin1.visible = false;
    pin2.visible = false;
    pin3.visible = false;
};

// 将函数暴露给全局
window.startVirtualTour = startVirtualTour;
window.hideVirtualTourPins = hideVirtualTourPins;

// 创建三个场景容器
const projectContainer = document.getElementById("viewerContainer"); // 现有的容器
const cesiumContainer = document.createElement('div');
cesiumContainer.id = 'cesiumContainer';
const ifcContainer = document.createElement('div');
ifcContainer.id = 'ifcContainer';

// 设置容器样式
[cesiumContainer, ifcContainer].forEach(container => {
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.display = 'none'; // 默认隐藏
  document.body.appendChild(container);
});

// 初始化三个模式的场景
const initScenes = () => {
  // Project Mode (现有的 THREE.js 场景)
  // ... 保持现有的场景初始化代码 ...

  // City Mode (Cesium)
  const viewer = new Cesium.Viewer(cesiumContainer, {
    terrainProvider: Cesium.createWorldTerrain(),
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false
  });

  // IFC Mode (纯 IFC 模型显示)
  const ifcScene = new THREE.Scene();
  const ifcCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const ifcRenderer = new THREE.WebGLRenderer({ antialias: true });
  ifcRenderer.setSize(window.innerWidth, window.innerHeight);
  ifcContainer.appendChild(ifcRenderer.domElement);
  
  return { viewer, ifcScene, ifcCamera, ifcRenderer };
};

// City Mode (Cesium 功能)
const initCityMode = () => {
  // 设置 Cesium 初始视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.3915, 39.9053, 1500),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0.0
    }
  });

  // 加载城市数据
  // ... Cesium 相关功能代码 ...
};

// IFC Mode (纯 IFC 模型显示)
const initIfcMode = () => {
  // 加载 IFC 模型
  const ifcLoader = new IFCLoader();
  ifcLoader.load(
    './model/your-model.ifc',
    (ifcModel) => {
      ifcScene.add(ifcModel);
      // 设置相机位置
      ifcCamera.position.set(10, 10, 10);
      ifcCamera.lookAt(0, 0, 0);
    }
  );
};






