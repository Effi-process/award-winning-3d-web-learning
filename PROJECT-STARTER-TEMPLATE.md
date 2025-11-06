# Project Starter Template
## Three.js + GSAP + Lenis Smooth Scroll

---

## Projektstruktur

```
award-winning-3d-website/
├── src/
│   ├── js/
│   │   ├── main.js                 # Entry point
│   │   ├── Scene.js                # Three.js scene setup
│   │   ├── Camera.js               # Camera configuration
│   │   ├── Renderer.js             # Renderer setup
│   │   ├── animations/
│   │   │   ├── ScrollAnimations.js # GSAP ScrollTrigger
│   │   │   └── CameraPath.js       # Camera animations
│   │   ├── scenes/
│   │   │   ├── StarfieldScene.js   # Sternenhimmel
│   │   │   ├── AuroraScene.js      # Polarlichter
│   │   │   ├── DesertScene.js      # Wüste
│   │   │   └── MountainScene.js    # Berge & Wolken
│   │   ├── shaders/
│   │   │   ├── starfield/
│   │   │   │   ├── vertex.glsl
│   │   │   │   └── fragment.glsl
│   │   │   ├── aurora/
│   │   │   │   ├── vertex.glsl
│   │   │   │   └── fragment.glsl
│   │   │   └── utils/
│   │   │       └── noise.glsl
│   │   └── utils/
│   │       ├── AssetLoader.js
│   │       ├── PerformanceMonitor.js
│   │       └── ResponsiveManager.js
│   ├── styles/
│   │   └── main.css
│   └── index.html
├── public/
│   ├── assets/
│   │   ├── models/
│   │   ├── textures/
│   │   ├── hdri/
│   │   └── sounds/
│   └── favicon.ico
├── package.json
├── vite.config.js
└── README.md
```

---

## package.json

```json
{
  "name": "award-winning-3d-website",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.160.0",
    "gsap": "^3.12.5",
    "lenis": "^1.0.42"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-glsl": "^1.2.1"
  }
}
```

---

## vite.config.js

```javascript
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

---

## index.html

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Award-Winning 3D Website</title>
  <meta name="description" content="Eine fotorealistische 3D-Web-Experience">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Loading Screen -->
  <div id="loading-screen" class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-text">Lädt <span id="loading-progress">0</span>%</p>
    </div>
  </div>

  <!-- Canvas Container -->
  <canvas id="webgl" class="webgl"></canvas>

  <!-- Content Sections -->
  <div id="content" class="content">
    <!-- Section 1: Starfield -->
    <section class="section section-starfield" data-scene="starfield">
      <div class="container">
        <h1 class="title">Sternenhimmel</h1>
        <p class="description">Tausende von Sternen erstrahlen im Universum</p>
      </div>
    </section>

    <!-- Section 2: Aurora -->
    <section class="section section-aurora" data-scene="aurora">
      <div class="container">
        <h1 class="title">Polarlichter</h1>
        <p class="description">Magische Aurora Borealis tanzt am Himmel</p>
      </div>
    </section>

    <!-- Section 3: Desert -->
    <section class="section section-desert" data-scene="desert">
      <div class="container">
        <h1 class="title">Wüstenlandschaft</h1>
        <p class="description">Endlose Sanddünen unter strahlender Sonne</p>
      </div>
    </section>

    <!-- Section 4: Mountains -->
    <section class="section section-mountains" data-scene="mountains">
      <div class="container">
        <h1 class="title">Bergwelt</h1>
        <p class="description">Majestätische Gipfel durchbrechen die Wolken</p>
      </div>
    </section>
  </div>

  <script type="module" src="/src/js/main.js"></script>
</body>
</html>
```

---

## main.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
  background: #000;
  color: #fff;
}

/* Canvas */
.webgl {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Loading Screen */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease-out;
}

.loading-screen.hidden {
  opacity: 0;
  pointer-events: none;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  opacity: 0.7;
}

/* Content */
.content {
  position: relative;
  z-index: 2;
  pointer-events: none;
}

.section {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  pointer-events: auto;
}

.title {
  font-size: clamp(40px, 8vw, 100px);
  font-weight: 700;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(50px);
}

.description {
  font-size: clamp(16px, 2vw, 24px);
  font-weight: 300;
  opacity: 0;
  transform: translateY(30px);
}

/* Responsive */
@media (max-width: 768px) {
  .section {
    padding: 60px 20px;
  }
}
```

---

## main.js

```javascript
import '../styles/main.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { SceneManager } from './Scene.js';
import { CameraManager } from './Camera.js';
import { RendererManager } from './Renderer.js';
import { setupScrollAnimations } from './animations/ScrollAnimations.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync GSAP ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Three.js Setup
const canvas = document.querySelector('#webgl');
const sceneManager = new SceneManager();
const cameraManager = new CameraManager();
const rendererManager = new RendererManager(canvas);

const scene = sceneManager.scene;
const camera = cameraManager.camera;
const renderer = rendererManager.renderer;

// Loading Manager
const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.getElementById('loading-progress');

loadingManager.onProgress = (url, loaded, total) => {
  const progress = Math.round((loaded / total) * 100);
  loadingProgress.textContent = progress;
};

loadingManager.onLoad = () => {
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }, 500);
};

// Setup Scroll Animations
setupScrollAnimations(camera, scene);

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Update scenes
  sceneManager.update(delta, elapsed);

  // Render
  renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
  cameraManager.onResize();
  rendererManager.onResize();
});

console.log('🚀 Award-Winning 3D Website - Initialized');
```

---

## Scene.js

```javascript
import * as THREE from 'three';
import { StarfieldScene } from './scenes/StarfieldScene.js';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.002);

    this.setupLights();
    this.setupScenes();
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);
  }

  setupScenes() {
    // Starfield Scene
    this.starfield = new StarfieldScene();
    this.scene.add(this.starfield.group);

    // Additional scenes will be added here
    // this.aurora = new AuroraScene();
    // this.desert = new DesertScene();
    // this.mountains = new MountainScene();
  }

  update(delta, elapsed) {
    this.starfield.update(delta, elapsed);
    // Update other scenes
  }
}
```

---

## Camera.js

```javascript
import * as THREE from 'three';

export class CameraManager {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.z = 5;
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
```

---

## Renderer.js

```javascript
import * as THREE from 'three';

export class RendererManager {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Realistic rendering
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
```

---

## scenes/StarfieldScene.js

```javascript
import * as THREE from 'three';
import vertexShader from '../shaders/starfield/vertex.glsl';
import fragmentShader from '../shaders/starfield/fragment.glsl';

export class StarfieldScene {
  constructor() {
    this.group = new THREE.Group();
    this.createStarfield();
  }

  createStarfield() {
    const starsCount = 10000;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);

    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3;

      // Random sphere distribution
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Star colors (temperature variation)
      const temp = Math.random();
      colors[i3] = temp > 0.8 ? 1.0 : 0.8 + Math.random() * 0.2;
      colors[i3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i3 + 2] = temp < 0.2 ? 1.0 : 0.8 + Math.random() * 0.2;

      sizes[i] = Math.random() * 2.0 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.stars = new THREE.Points(geometry, material);
    this.group.add(this.stars);
  }

  update(delta, elapsed) {
    this.stars.material.uniforms.uTime.value = elapsed;
    this.stars.rotation.y += delta * 0.02;
  }
}
```

---

## shaders/starfield/vertex.glsl

```glsl
uniform float uTime;
uniform float uPixelRatio;

attribute float size;
attribute vec3 color;

varying vec3 vColor;

void main() {
  vColor = color;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Size attenuation
  gl_PointSize = size * uPixelRatio * 100.0 / -viewPosition.z;
}
```

---

## shaders/starfield/fragment.glsl

```glsl
varying vec3 vColor;

void main() {
  // Circular point
  float distanceToCenter = length(gl_PointCoord - vec2(0.5));
  float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);

  vec3 color = vColor * strength;

  gl_FragColor = vec4(color, strength);
}
```

---

## animations/ScrollAnimations.js

```javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function setupScrollAnimations(camera, scene) {
  // Animate text on scroll
  const sections = document.querySelectorAll('.section');

  sections.forEach((section, index) => {
    const title = section.querySelector('.title');
    const description = section.querySelector('.description');

    gsap.to(title, {
      scrollTrigger: {
        trigger: section,
        start: 'top center',
        end: 'center center',
        scrub: 1
      },
      opacity: 1,
      y: 0,
      duration: 1
    });

    gsap.to(description, {
      scrollTrigger: {
        trigger: section,
        start: 'top center',
        end: 'center center',
        scrub: 1
      },
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 0.2
    });

    // Camera movement per section
    gsap.to(camera.position, {
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
      },
      z: 5 - index * 2,
      ease: 'none'
    });
  });

  console.log('📜 Scroll Animations - Initialized');
}
```

---

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Development

```bash
npm run dev
```

Öffnet automatisch Browser auf http://localhost:3000

### 3. Build

```bash
npm run build
```

Output in `dist/` Ordner

### 4. Preview Build

```bash
npm run preview
```

---

## Next Steps

1. **Ergänze weitere Szenen**: AuroraScene, DesertScene, MountainScene
2. **Füge Post-Processing hinzu**: Bloom, DOF, Color Grading
3. **Implementiere Audio**: Spatial Audio mit Three.js AudioListener
4. **Optimiere Performance**: LOD, Instancing, Frustum Culling
5. **Responsive Design**: Mobile-optimierte Erfahrung
6. **SEO & Meta Tags**: Open Graph, Twitter Cards

---

## Tipps

- **Entwicklung**: Nutze `markers: true` in ScrollTrigger für Debugging
- **Performance**: Monitore FPS mit stats.js
- **Assets**: Optimiere Texturen auf max 2048x2048
- **Mobile**: Reduziere Partikelanzahl auf mobilen Geräten
- **Browser Testing**: Teste in Chrome, Firefox, Safari

---

**Viel Erfolg beim Bauen deiner award-würdigen Website!**
