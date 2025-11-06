# Award-Winning 3D Web Development Mastery Guide
## Fotorealistische 3D-Welten mit Three.js, GSAP & WebGL

---

## Inhaltsverzeichnis

1. [Technologie-Stack Übersicht](#technologie-stack-übersicht)
2. [Grundlagen: GSAP Animation](#grundlagen-gsap-animation)
3. [Three.js Fundamentals](#threejs-fundamentals)
4. [Shader-Programmierung (GLSL)](#shader-programmierung-glsl)
5. [Spezifische Szenen-Implementierung](#spezifische-szenen-implementierung)
6. [Kamerafahrten & Cinematische Techniken](#kamerafahrten--cinematische-techniken)
7. [Performance-Optimierung](#performance-optimierung)
8. [Post-Processing & Realismus](#post-processing--realismus)
9. [Audio-Integration](#audio-integration)
10. [Tools & Workflow](#tools--workflow)
11. [Award-Winning Best Practices](#award-winning-best-practices)
12. [Lernressourcen & Code-Beispiele](#lernressourcen--code-beispiele)
13. [Advanced Topics (siehe ADVANCED-TECHNIQUES.md)](#advanced-topics)

> **Hinweis**: Dieses Dokument deckt Fundamentals und Intermediate Techniken ab. Für fortgeschrittene Themen wie WebGPU, Path Tracing, GPGPU, und mehr siehe **[ADVANCED-TECHNIQUES.md](./ADVANCED-TECHNIQUES.md)**

---

## Technologie-Stack Übersicht

### Core Technologies

#### **Three.js (WebGL)**
- **Zweck**: 3D-Rendering-Engine für den Browser
- **Version**: Latest (r160+)
- **Kernkonzepte**: Scene, Camera, Renderer, Geometry, Material, Mesh
- **Dokumentation**: https://threejs.org/docs/

#### **GSAP (GreenSock Animation Platform)**
- **Zweck**: Hochperformante Animationen, Scroll-Trigger
- **Plugins**: ScrollTrigger, MotionPathPlugin
- **Status 2025**: Komplett kostenlos (inkl. alle Premium-Plugins) seit Webflow-Übernahme
- **Dokumentation**: https://gsap.com/docs/

#### **WebGL & GLSL**
- **Zweck**: GPU-beschleunigte Grafik, Custom Shaders
- **Shader-Types**: Vertex Shader, Fragment Shader
- **Sprache**: GLSL (OpenGL Shading Language)

#### **WebGPU (Next-Gen - 2025)**
- **Status**: Produktionsreif in Chrome/Edge, experimentell in anderen Browsern
- **Vorteile**: 30-40% bessere Performance, Compute Shaders, GPU-Driven Rendering
- **Migration**: Three.js unterstützt WebGPURenderer seit r160+
- **Empfehlung**: Für neue Projekte mit 6-12 Monaten Entwicklungszeit
- **Dokumentation**: https://webgpufundamentals.org/

### Empfohlene Zusatz-Libraries

#### **React Three Fiber (Optional)**
- React-Integration für Three.js
- Deklaratives API
- **Drei**: Helper-Library (Controls, Loaders, Post-Processing)
- **Vorteil**: Component-basiertes 3D-Development

#### **Theatre.js**
- Timeline-basierter Animation-Editor
- Keyframe-Animationen im Browser
- Integration mit Three.js
- Perfekt für cinematische Sequenzen

#### **Lenis Smooth Scroll**
- **Empfehlung 2025**: Besser als Locomotive Scroll
- Lightweight, performant
- Native Scroll-APIs intakt
- Perfekte GSAP ScrollTrigger Integration

#### **Post-Processing**
- **pmndrs/postprocessing**: Performance-optimierte Post-FX Library
- UnrealBloomPass, Depth of Field, etc.

---

## Grundlagen: GSAP Animation

### ScrollTrigger Mastery

#### Basis-Setup
```javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
```

#### Pinning (Elemente "fixieren")
```javascript
gsap.to(".element", {
  scrollTrigger: {
    trigger: ".container",
    start: "top top",
    end: "bottom top",
    pin: true,
    pinSpacing: false,
    scrub: true, // Bindet Animation an Scrollbar
    markers: true // Debug-Marker (entfernen in Produktion)
  },
  scale: 2,
  rotation: 360
});
```

#### Scrubbing Techniken
- **`scrub: true`**: Sofortige Bindung an Scrollbar
- **`scrub: 1`**: 1 Sekunde "catch-up" delay (smoother)
- **`scrub: 2`**: 2 Sekunden delay (sehr smooth, cinematisch)

#### Timeline + ScrollTrigger
```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".section",
    start: "top center",
    end: "bottom center",
    scrub: 2
  }
});

tl.to(".camera", { z: 5, duration: 1 })
  .to(".object", { rotation: Math.PI * 2, duration: 1 }, "-=0.5")
  .to(".light", { intensity: 2, duration: 0.5 });
```

#### 3D Camera Animation mit GSAP
```javascript
// Smooth Camera Movement
gsap.to(camera.position, {
  x: 10,
  y: 5,
  z: -10,
  duration: 2,
  ease: "power2.inOut",
  onUpdate: () => {
    camera.lookAt(targetPosition);
    renderer.render(scene, camera);
  }
});
```

### Advanced GSAP Techniques

#### Responsive Animations
```javascript
ScrollTrigger.matchMedia({
  "(min-width: 800px)": function() {
    // Desktop Animations
  },
  "(max-width: 799px)": function() {
    // Mobile Animations
  }
});
```

#### Easing-Funktionen für Cinematisches Feeling
- **`power1.inOut`**: Sanft
- **`power3.inOut`**: Dramatisch
- **`expo.inOut`**: Sehr dramatisch
- **`elastic.out`**: Spielerisch (sparsam verwenden)
- **Custom Cubic-Bezier**: Für exakte Kontrolle

---

## Three.js Fundamentals

### Szenen-Setup (Best Practice)

```javascript
import * as THREE from 'three';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,                                    // FOV
  window.innerWidth / window.innerHeight, // Aspect Ratio
  0.1,                                   // Near Clipping
  1000                                   // Far Clipping
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance!
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Realistisch
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);
```

### PBR Materials für Realismus

```javascript
const material = new THREE.MeshStandardMaterial({
  map: textureLoader.load('baseColor.jpg'),
  normalMap: textureLoader.load('normal.jpg'),
  roughnessMap: textureLoader.load('roughness.jpg'),
  metalnessMap: textureLoader.load('metallic.jpg'),
  aoMap: textureLoader.load('ao.jpg'),
  envMapIntensity: 1.5
});
```

### HDR Environment Lighting

```javascript
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three';

const rgbeLoader = new RGBELoader();
rgbeLoader.load('environment.hdr', (texture) => {
  const pmremGenerator = new PMREMGenerator(renderer);
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;

  scene.environment = envMap;
  scene.background = envMap; // Optional

  pmremGenerator.dispose();
});
```

### Responsive & Resize Handling

```javascript
window.addEventListener('resize', () => {
  // Update Camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update Renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update Composer (if using post-processing)
  composer.setSize(window.innerWidth, window.innerHeight);
});
```

### Animation Loop (Optimal)

```javascript
let lastTime = 0;
const clock = new THREE.Clock();

function animate(time) {
  requestAnimationFrame(animate);

  const delta = clock.getDelta(); // Frame-independent
  const elapsed = clock.getElapsedTime();

  // Update Animations
  // mesh.rotation.y += delta * 0.5;

  // Update Controls (if using)
  // controls.update();

  // Render
  renderer.render(scene, camera);
  // OR with post-processing: composer.render();
}

animate();
```

---

## Shader-Programmierung (GLSL)

### Grundstruktur

#### Vertex Shader
```glsl
// Vertex Shader transformiert Vertex-Positionen
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

#### Fragment Shader
```glsl
// Fragment Shader färbt jeden Pixel
uniform float uTime;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
  vec3 color = uColor * vec3(vUv, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
```

### Custom ShaderMaterial in Three.js

```javascript
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShaderCode,
  fragmentShader: fragmentShaderCode,
  uniforms: {
    uTime: { value: 0.0 },
    uColor: { value: new THREE.Color(0xff0000) },
    uResolution: { value: new THREE.Vector2(width, height) }
  },
  side: THREE.DoubleSide,
  transparent: true
});

// Update in Animation Loop
function animate() {
  material.uniforms.uTime.value = clock.getElapsedTime();
  renderer.render(scene, camera);
}
```

### Noise Functions (Essentiell für Organische Effekte)

#### Perlin Noise (Classic)
```glsl
// Include: https://github.com/ashima/webgl-noise

#pragma glslify: cnoise = require('glsl-noise/classic/3d')

float noise = cnoise(vec3(vPosition * 2.0 + uTime));
```

#### Simplex Noise (Bessere Performance)
```glsl
#pragma glslify: snoise = require('glsl-noise/simplex/3d')

float noise = snoise(vec3(vPosition * 2.0 + uTime));
```

#### Fractal Brownian Motion (FBM)
```glsl
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  // Octaves für Detailreichtum
  for (int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;  // Lacunarity
    amplitude *= 0.5;  // Persistence (Gain)
  }

  return value;
}
```

### Signed Distance Fields (SDF) für Raymarching

#### Basic Shapes
```glsl
// Sphere
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// Box
float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

// Torus
float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}
```

#### Raymarching Loop
```glsl
float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;

  for (int i = 0; i < 100; i++) {
    vec3 pos = ro + rd * t;
    float d = sceneSDF(pos);

    if (d < 0.001 || t > 100.0) break;

    t += d;
  }

  return t;
}
```

### Wichtige GLSL Utility Functions

```glsl
// Remap value from one range to another
float remap(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

// Smooth minimum (organic blending)
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

// Rotation Matrix 2D
mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}
```

---

## Spezifische Szenen-Implementierung

### 1. Sternenhimmel (Starfield)

#### Ansatz A: Particle System
```javascript
const starsGeometry = new THREE.BufferGeometry();
const starCount = 10000;

const positions = new Float32Array(starCount * 3);
const colors = new Float32Array(starCount * 3);
const sizes = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;

  // Position: Random Sphere Distribution
  const radius = 50 + Math.random() * 100;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i3 + 2] = radius * Math.cos(phi);

  // Color: Verschiedene Stern-Temperaturen
  const temp = Math.random();
  colors[i3] = temp > 0.8 ? 1.0 : 0.8 + Math.random() * 0.2;
  colors[i3 + 1] = 0.8 + Math.random() * 0.2;
  colors[i3 + 2] = temp < 0.2 ? 1.0 : 0.8 + Math.random() * 0.2;

  // Size variation
  sizes[i] = Math.random() * 2.0 + 0.5;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const starsMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() }
  },
  vertexShader: `
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
      gl_PointSize = size * uPixelRatio * 100.0 / -viewPosition.z;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;

    void main() {
      // Circular point
      float distanceToCenter = length(gl_PointCoord - vec2(0.5));
      float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);

      // Twinkle effect
      vec3 color = vColor * strength;

      gl_FragColor = vec4(color, strength);
    }
  `,
  transparent: true,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);
```

#### Ansatz B: Procedural Shader (GPU-basiert)
```glsl
// Fragment Shader für Starfield
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 starfield(vec2 uv) {
  vec3 color = vec3(0.0);

  // Multiple layers mit verschiedenen Größen
  for (float i = 0.0; i < 3.0; i++) {
    vec2 layer = uv * (50.0 + i * 30.0);
    vec2 gridPos = floor(layer);
    vec2 gridUv = fract(layer) - 0.5;

    float random = hash(gridPos + i);

    if (random > 0.95) {
      float dist = length(gridUv);
      float star = smoothstep(0.02 / (i + 1.0), 0.0, dist);

      // Star color variation
      vec3 starColor = mix(vec3(1.0, 0.9, 0.8), vec3(0.8, 0.9, 1.0), random);
      color += star * starColor;
    }
  }

  return color;
}
```

### 2. Polarlichter (Aurora Borealis)

#### Volumetric Aurora Shader
```glsl
// Fragment Shader
uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;

varying vec2 vUv;
varying vec3 vPosition;

// FBM Noise (siehe oben einbinden)

float auroraPattern(vec3 p) {
  // Schichten von Noise für organische Bewegung
  float noise1 = fbm(vec3(p.x * 2.0, p.y * 0.5 + uTime * 0.1, p.z * 2.0));
  float noise2 = fbm(vec3(p.x * 3.0 + uTime * 0.05, p.y * 0.3, p.z * 3.0));

  // Wellenbewegung
  float wave = sin(p.x * 3.0 + uTime * 0.2 + noise1 * 3.0) * 0.5 + 0.5;

  // Vertikale Streifen
  float vertical = smoothstep(0.3, 0.7, p.y) * smoothstep(1.0, 0.5, p.y);

  return wave * vertical * (noise1 + noise2) * 0.5;
}

void main() {
  vec3 p = vPosition;

  float aurora = auroraPattern(p);

  // Farbverlauf von grün zu blau zu violett
  vec3 color = mix(
    vec3(0.0, 1.0, 0.5),  // Grün
    vec3(0.5, 0.0, 1.0),  // Violett
    smoothstep(0.3, 0.7, vUv.y)
  );

  // Fractal Brownian Motion für Details
  color += fbm(p * 5.0 + uTime * 0.1) * 0.2;

  float alpha = aurora * 0.8;

  gl_FragColor = vec4(color, alpha);
}
```

#### Three.js Setup für Aurora
```javascript
const auroraGeometry = new THREE.PlaneGeometry(100, 30, 128, 128);
const auroraMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color(0x00ff88) },
    uColorEnd: { value: new THREE.Color(0x8800ff) }
  },
  vertexShader: auroraVertexShader,
  fragmentShader: auroraFragmentShader,
  transparent: true,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending
});

const aurora = new THREE.Mesh(auroraGeometry, auroraMaterial);
aurora.position.y = 20;
aurora.rotation.x = -Math.PI * 0.1;
scene.add(aurora);
```

### 3. Wüsten-Szenerie

#### Procedural Terrain mit Dünen
```javascript
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

const noise = new ImprovedNoise();

function generateDesertTerrain() {
  const geometry = new THREE.PlaneGeometry(200, 200, 256, 256);
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);

    // Multi-octave noise für realistische Dünen
    let height = 0;
    let amplitude = 8;
    let frequency = 0.02;

    for (let j = 0; j < 4; j++) {
      height += amplitude * noise.noise(
        x * frequency,
        y * frequency,
        0
      );
      amplitude *= 0.5;
      frequency *= 2;
    }

    // Sanfte Hügel-Form
    height = Math.max(height, 0) * 0.8;

    position.setZ(i, height);
  }

  geometry.computeVertexNormals();
  return geometry;
}

const desertGeometry = generateDesertTerrain();
const desertMaterial = new THREE.MeshStandardMaterial({
  color: 0xdaa520,
  roughness: 0.9,
  metalness: 0.1
});

const desert = new THREE.Mesh(desertGeometry, desertMaterial);
desert.rotation.x = -Math.PI / 2;
scene.add(desert);
```

#### Sand Shader mit Detail
```glsl
// Fragment Shader für realistischen Sand
uniform sampler2D uSandTexture;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 baseColor = vec3(0.95, 0.85, 0.6); // Sandfarbe

  // Mikrostruktur mit Noise
  float microDetail = fbm(vPosition * 50.0) * 0.1;

  // Normal Mapping Simulation
  vec3 normal = normalize(vNormal);

  // Subsurface Scattering Approximation
  float subsurface = pow(clamp(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0, 1.0), 2.0);

  vec3 color = baseColor + microDetail + subsurface * vec3(1.0, 0.9, 0.7) * 0.3;

  gl_FragColor = vec4(color, 1.0);
}
```

### 4. Berge mit Wolken-Kamerafahrten

#### Procedural Mountains
```javascript
function generateMountainTerrain() {
  const geometry = new THREE.PlaneGeometry(500, 500, 512, 512);
  const position = geometry.attributes.position;

  const noise = new ImprovedNoise();

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);

    // Große Bergformationen
    let height = 0;

    // Base mountains
    height += Math.abs(noise.noise(x * 0.003, y * 0.003, 0)) * 80;

    // Medium details
    height += noise.noise(x * 0.01, y * 0.01, 100) * 30;

    // Fine details (Felsen)
    height += noise.noise(x * 0.05, y * 0.05, 200) * 5;

    // Täler und Peaks akzentuieren
    height = Math.pow(height / 100, 1.5) * 100;

    position.setZ(i, height);
  }

  geometry.computeVertexNormals();
  return geometry;
}
```

#### Volumetric Clouds (Raymarching)
```glsl
// Fragment Shader für volumetrische Wolken
uniform vec3 uCameraPos;
uniform float uTime;

varying vec2 vUv;
varying vec3 vWorldPosition;

// Cloud Density Function
float cloudDensity(vec3 p) {
  // Basis Cloud Shape
  float density = fbm(p * 0.5 + vec3(uTime * 0.02, 0.0, 0.0));

  // Detail Layer
  density += fbm(p * 2.0 + vec3(0.0, uTime * 0.01, 0.0)) * 0.3;

  // Höhen-Falloff
  float heightFalloff = smoothstep(10.0, 30.0, p.y) * smoothstep(60.0, 40.0, p.y);

  return max(density * heightFalloff - 0.4, 0.0);
}

// Light Scattering (Henyey-Greenstein Phase Function)
float henyeyGreenstein(float cosTheta, float g) {
  float g2 = g * g;
  return (1.0 - g2) / (4.0 * 3.14159 * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}

// Raymarching für Wolken
vec4 raymarchClouds(vec3 ro, vec3 rd) {
  vec3 color = vec3(1.0);
  float transmittance = 1.0;
  float depth = 0.0;

  const int steps = 64;
  const float stepSize = 2.0;

  for (int i = 0; i < steps; i++) {
    vec3 pos = ro + rd * depth;

    float density = cloudDensity(pos);

    if (density > 0.01) {
      // Light sampling
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
      float lightDensity = cloudDensity(pos + lightDir * 2.0);

      float scattering = henyeyGreenstein(dot(rd, lightDir), 0.3);
      float lighting = exp(-lightDensity) * scattering;

      transmittance *= exp(-density * stepSize * 0.1);
      color = mix(color, vec3(lighting), density * 0.5);
    }

    depth += stepSize;

    if (transmittance < 0.01 || depth > 100.0) break;
  }

  return vec4(color, 1.0 - transmittance);
}

void main() {
  vec3 ro = uCameraPos;
  vec3 rd = normalize(vWorldPosition - uCameraPos);

  vec4 clouds = raymarchClouds(ro, rd);

  // Sky gradient background
  vec3 skyColor = mix(
    vec3(0.5, 0.7, 1.0),  // Horizont
    vec3(0.1, 0.3, 0.8),  // Zenith
    rd.y * 0.5 + 0.5
  );

  vec3 finalColor = mix(skyColor, clouds.rgb, clouds.a);

  gl_FragColor = vec4(finalColor, 1.0);
}
```

---

## Kamerafahrten & Cinematische Techniken

### 1. Spline-basierte Kamera-Pfade

```javascript
import { CatmullRomCurve3 } from 'three';

// Definiere Kamera-Wegpunkte
const waypoints = [
  new THREE.Vector3(0, 10, 50),
  new THREE.Vector3(30, 15, 20),
  new THREE.Vector3(50, 20, -10),
  new THREE.Vector3(30, 10, -40),
  new THREE.Vector3(0, 5, -60)
];

// Smooth Curve
const cameraPath = new CatmullRomCurve3(waypoints);
cameraPath.closed = false; // true für Loop

// Visualisierung (Debug)
const points = cameraPath.getPoints(100);
const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const pathLine = new THREE.Line(lineGeometry, lineMaterial);
scene.add(pathLine);
```

### 2. Scroll-basierte Kamera-Animation

```javascript
let scrollProgress = 0;

// ScrollTrigger Setup
ScrollTrigger.create({
  trigger: ".scene-section",
  start: "top top",
  end: "bottom bottom",
  scrub: 2,
  onUpdate: (self) => {
    scrollProgress = self.progress;
  }
});

// Animation Loop
function animate() {
  // Position auf Pfad
  const point = cameraPath.getPointAt(scrollProgress);
  camera.position.copy(point);

  // Tangente für smooth Look-at
  const tangent = cameraPath.getTangentAt(scrollProgress);
  const lookAt = point.clone().add(tangent);
  camera.lookAt(lookAt);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

### 3. Theatre.js für Komplexe Sequenzen

```javascript
import studio from '@theatre/studio';
import { getProject } from '@theatre/core';

// Nur in Development
if (process.env.NODE_ENV === 'development') {
  studio.initialize();
}

const project = getProject('My Project');
const sheet = project.sheet('Scene');

const cameraObj = sheet.object('Camera', {
  position: { x: 0, y: 10, z: 50 },
  rotation: { x: 0, y: 0, z: 0 }
});

cameraObj.onValuesChange((values) => {
  camera.position.set(values.position.x, values.position.y, values.position.z);
  camera.rotation.set(values.rotation.x, values.rotation.y, values.rotation.z);
});

// Play sequence
sheet.sequence.play({ iterationCount: Infinity });
```

### 4. Cinematische Kamera-Einstellungen

#### Depth of Field Simulation
```javascript
camera.fov = 35; // Cinematisch (nicht zu weit)
camera.updateProjectionMatrix();

// Post-Processing mit Bokeh
const bokehPass = new BokehPass(scene, camera, {
  focus: 1.0,
  aperture: 0.025,
  maxblur: 0.01
});
composer.addPass(bokehPass);
```

#### Motion Blur
```javascript
const motionBlurPass = new MotionBlurPass(scene, camera);
composer.addPass(motionBlurPass);
```

#### Camera Shake (subtil für Realismus)
```javascript
function addCameraShake(intensity = 0.01) {
  camera.position.x += (Math.random() - 0.5) * intensity;
  camera.position.y += (Math.random() - 0.5) * intensity;
}
```

### 5. Übergänge zwischen Szenen

```javascript
function transitionToScene(targetCamera, duration = 2) {
  const startPos = camera.position.clone();
  const startRot = camera.rotation.clone();

  gsap.to({}, {
    duration: duration,
    ease: "power3.inOut",
    onUpdate: function() {
      const progress = this.progress();

      camera.position.lerpVectors(startPos, targetCamera.position, progress);
      camera.rotation.set(
        THREE.MathUtils.lerp(startRot.x, targetCamera.rotation.x, progress),
        THREE.MathUtils.lerp(startRot.y, targetCamera.rotation.y, progress),
        THREE.MathUtils.lerp(startRot.z, targetCamera.rotation.z, progress)
      );
    }
  });
}
```

---

## Performance-Optimierung

### 1. Level of Detail (LOD)

```javascript
const lod = new THREE.LOD();

// High Detail (nah)
const highDetailMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  material
);
lod.addLevel(highDetailMesh, 0);

// Medium Detail
const mediumDetailMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  material
);
lod.addLevel(mediumDetailMesh, 20);

// Low Detail (weit)
const lowDetailMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 16, 16),
  material
);
lod.addLevel(lowDetailMesh, 50);

scene.add(lod);
```

### 2. Instancing für Wiederholte Geometrie

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

const count = 10000;
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

const matrix = new THREE.Matrix4();
const position = new THREE.Vector3();
const rotation = new THREE.Euler();
const quaternion = new THREE.Quaternion();
const scale = new THREE.Vector3(1, 1, 1);

for (let i = 0; i < count; i++) {
  position.set(
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
    Math.random() * 100 - 50
  );

  rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  quaternion.setFromEuler(rotation);
  matrix.compose(position, quaternion, scale);

  instancedMesh.setMatrixAt(i, matrix);
}

scene.add(instancedMesh);
```

### 3. Frustum Culling Optimization

```javascript
// Automatisch in Three.js, aber für InstancedMesh custom:
const frustum = new THREE.Frustum();
const cameraViewProjectionMatrix = new THREE.Matrix4();

function updateInstancedMeshCulling() {
  camera.updateMatrixWorld();
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  cameraViewProjectionMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

  // Check instances
  for (let i = 0; i < instancedMesh.count; i++) {
    instancedMesh.getMatrixAt(i, matrix);
    position.setFromMatrixPosition(matrix);

    if (!frustum.containsPoint(position)) {
      // Hide oder skip
      instancedMesh.setColorAt(i, new THREE.Color(0x000000)); // Beispiel
    }
  }

  instancedMesh.instanceColor.needsUpdate = true;
}
```

### 4. Texture Optimization

```javascript
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('texture.jpg');

// Compression
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Proper disposal
function disposeTexture(texture) {
  if (texture) {
    texture.dispose();
  }
}
```

### 5. On-Demand Rendering (React Three Fiber)

```javascript
// Nur rendern wenn nötig
<Canvas frameloop="demand">
  <Scene />
</Canvas>

// Manuell invalidieren
import { useThree } from '@react-three/fiber';

function Component() {
  const invalidate = useThree((state) => state.invalidate);

  const handleClick = () => {
    // Do something
    invalidate(); // Trigger re-render
  };
}
```

### 6. Web Workers für Heavy Computations

```javascript
// worker.js
self.addEventListener('message', (e) => {
  const { vertices, noise } = e.data;

  // Heavy terrain generation
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 2] = calculateHeight(vertices[i], vertices[i + 1]);
  }

  self.postMessage({ vertices });
});

// main.js
const worker = new Worker('worker.js');

worker.postMessage({
  vertices: geometry.attributes.position.array,
  noise: noiseData
});

worker.addEventListener('message', (e) => {
  geometry.attributes.position.array = e.data.vertices;
  geometry.attributes.position.needsUpdate = true;
});
```

### 7. PixelRatio Management

```javascript
// Adaptive PixelRatio basierend auf Performance
let currentPixelRatio = Math.min(window.devicePixelRatio, 2);

function monitorPerformance() {
  const fps = performance.now();

  if (fps < 30 && currentPixelRatio > 1) {
    currentPixelRatio = 1;
    renderer.setPixelRatio(currentPixelRatio);
  } else if (fps > 55 && currentPixelRatio < 2) {
    currentPixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(currentPixelRatio);
  }
}
```

---

## Post-Processing & Realismus

### Setup mit EffectComposer

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

const composer = new EffectComposer(renderer);

// Base Render
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// SSAO (Ambient Occlusion)
const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
ssaoPass.kernelRadius = 16;
ssaoPass.minDistance = 0.005;
ssaoPass.maxDistance = 0.1;
composer.addPass(ssaoPass);

// Bloom
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,   // Intensity
  0.4,   // Radius
  0.85   // Threshold
);
composer.addPass(bloomPass);
```

### Selective Bloom (nur bestimmte Objekte)

```javascript
const bloomLayer = new THREE.Layers();
bloomLayer.set(1);

// Objekte zum Bloom-Layer hinzufügen
glowingMesh.layers.enable(1);

// Custom Render
const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const materials = {};

function renderBloom(mask) {
  if (mask) {
    scene.traverse((obj) => {
      if (obj.isMesh && !bloomLayer.test(obj.layers)) {
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
      }
    });
  } else {
    scene.traverse((obj) => {
      if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
      }
    });
  }
}
```

### Color Grading

```javascript
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const colorGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uExposure: { value: 1.0 },
    uContrast: { value: 1.1 },
    uSaturation: { value: 1.2 },
    uBrightness: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uExposure;
    uniform float uContrast;
    uniform float uSaturation;
    uniform float uBrightness;

    varying vec2 vUv;

    vec3 adjustContrast(vec3 color, float contrast) {
      return (color - 0.5) * contrast + 0.5;
    }

    vec3 adjustSaturation(vec3 color, float saturation) {
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      return mix(vec3(gray), color, saturation);
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // Exposure
      color *= uExposure;

      // Contrast
      color = adjustContrast(color, uContrast);

      // Saturation
      color = adjustSaturation(color, uSaturation);

      // Brightness
      color += uBrightness;

      gl_FragColor = vec4(color, texel.a);
    }
  `
};

const colorGradePass = new ShaderPass(colorGradeShader);
composer.addPass(colorGradePass);
```

---

## Audio-Integration

### Spatial Audio mit Three.js

```javascript
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.PositionalAudio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('sound.mp3', (buffer) => {
  sound.setBuffer(buffer);
  sound.setRefDistance(20);
  sound.setLoop(true);
  sound.setVolume(0.5);
  sound.play();
});

// Attach zu Objekt
object.add(sound);
```

### Audio Analyzer für Visualisierungen

```javascript
const analyser = new THREE.AudioAnalyser(sound, 128);

function animate() {
  const data = analyser.getFrequencyData();

  // React auf Bass
  const bass = data[0] / 255;
  mesh.scale.set(1 + bass, 1 + bass, 1 + bass);

  // React auf Treble
  const treble = data[data.length - 1] / 255;
  bloomPass.strength = 1 + treble * 2;

  renderer.render(scene, camera);
}
```

---

## Tools & Workflow

### Development Setup

```json
// package.json
{
  "dependencies": {
    "three": "^0.160.0",
    "gsap": "^3.12.5",
    "lenis": "^1.0.42",
    "@theatre/core": "^0.7.1",
    "@theatre/studio": "^0.7.1"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "glslify": "^7.1.1"
  }
}
```

### GLSL Imports mit Vite

```javascript
// vite.config.js
import glsl from 'vite-plugin-glsl';

export default {
  plugins: [glsl()]
};

// Import in code
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
```

### Debugging Tools

```javascript
// Stats.js für FPS
import Stats from 'three/examples/jsm/libs/stats.module.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  stats.begin();
  // rendering
  stats.end();
}
```

```javascript
// r3f-perf für React Three Fiber
import { Perf } from 'r3f-perf';

<Canvas>
  <Perf position="top-left" />
</Canvas>
```

### Blender zu Three.js Workflow

1. **Modellierung in Blender**
2. **Export als glTF/GLB**:
   - File > Export > glTF 2.0
   - Format: GLB (binary)
   - Include: Selected Objects
   - Transform: +Y Up
3. **Optimization**:
   - gltf-transform: CLI tool für Compression
   - Draco compression für Geometrie
4. **Import in Three.js**:

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load('model.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

---

## Award-Winning Best Practices

### Awwwards & FWA Gewinner-Analyse (2025)

#### Gemeinsame Merkmale:

1. **Nahtlose Scroll-Experience**
   - Lenis für Smoothness
   - GSAP ScrollTrigger für Choreographie
   - Progressive Story-Telling

2. **Cinematische Präsentation**
   - Controlled Camera Movements
   - Depth of Field
   - Motion Blur
   - Color Grading

3. **Performance**
   - Laden in < 3 Sekunden
   - 60 FPS auf Desktop
   - 30+ FPS auf Mobile
   - Progressive Loading

4. **Interaktivität**
   - Subtile Hover-Effekte
   - Scroll-based Reveals
   - Audio-Reaktivität

5. **Ästhetik**
   - Mutige Farbpaletten
   - Kontraste für Lesbarkeit
   - Negative Space
   - Typography-Integration

### Code-Qualität Checklist

- [ ] TypeScript für Type Safety
- [ ] Modular Component Structure
- [ ] Proper Memory Management (dispose!)
- [ ] Mobile-Responsive
- [ ] Accessibility Considerations
- [ ] SEO-Optimization (Prerendering)
- [ ] Error Handling
- [ ] Loading States
- [ ] Performance Monitoring

### Visual Quality Checklist

- [ ] HDR Environment Maps
- [ ] PBR Materials
- [ ] Realistic Lighting (3-Point minimum)
- [ ] Shadows (Soft)
- [ ] Post-Processing (Bloom, AO, DOF)
- [ ] Color Grading
- [ ] Particle Effects
- [ ] Smooth Animations (60 FPS)

---

## Lernressourcen & Code-Beispiele

### Essential Tutorials

#### **Three.js Journey** (Bruno Simon)
- URL: https://threejs-journey.com
- Umfassendster Three.js Kurs
- 100+ Stunden Content
- Shader-Programmierung
- Post-Processing
- Performance

#### **The Book of Shaders**
- URL: https://thebookofshaders.com
- GLSL Fundamentals
- Noise Functions
- Patterns & Shapes
- Generative Art

#### **Discover Three.js**
- URL: https://discoverthreejs.com
- Kostenlos, Open Source
- Best Practices
- PBR & Lighting

#### **Maxime Heckel Blog**
- URL: https://blog.maximeheckel.com
- Advanced Shader Techniques
- Particles
- Volumetric Effects
- React Three Fiber

### GitHub Repositories (Must-Study)

#### **Three.js Examples**
- URL: https://github.com/mrdoob/three.js/tree/dev/examples
- Official Examples
- WebGL Demos
- Shader Samples

#### **THREE.Terrain**
- URL: https://github.com/IceCreamYou/THREE.Terrain
- Procedural Terrain Engine
- Multiple Algorithms
- Texture Generation

#### **pmndrs Ecosystem**
- **react-three-fiber**: https://github.com/pmndrs/react-three-fiber
- **drei**: https://github.com/pmndrs/drei
- **postprocessing**: https://github.com/pmndrs/postprocessing
- **react-spring**: https://github.com/pmndrs/react-spring

#### **ShaderParticleEngine**
- URL: https://github.com/squarefeet/ShaderParticleEngine
- GPU-based Particles
- Emitter Systems

#### **webgl-noise**
- URL: https://github.com/ashima/webgl-noise
- Perlin & Simplex Noise
- GLSL Implementation

#### **three-nebula**
- URL: https://github.com/creativelifeform/three-nebula
- Particle System Engine
- Visual Editor

### Shadertoy Essential Shaders

- **Starfield**: https://www.shadertoy.com/view/Md2SR3
- **Desert Sand**: https://www.shadertoy.com/view/ld3BzM
- **Volumetric Clouds**: https://www.shadertoy.com/view/XtS3DD
- **Aurora**: https://www.shadertoy.com/view/XtGGRt

### Community & Inspiration

- **Awwwards**: https://www.awwwards.com/websites/3d/
- **The FWA**: https://thefwa.com
- **Three.js Forum**: https://discourse.threejs.org
- **GSAP Forum**: https://gsap.com/community/forums/
- **Codrops**: https://tympanus.net/codrops

---

## Praktischer Implementierungs-Roadmap

### Phase 1: Fundamentals (Woche 1-2)

1. **Three.js Basics**
   - Scene, Camera, Renderer Setup
   - Geometries & Materials
   - Lighting
   - Animation Loop

2. **GSAP Integration**
   - Basic Tweens
   - Timeline
   - ScrollTrigger

3. **Erstes Shader**
   - Vertex + Fragment Shader
   - Uniforms
   - ShaderMaterial

### Phase 2: Advanced Techniques (Woche 3-4)

1. **Particle Systems**
   - GPU-based Particles
   - Custom Shaders
   - Starfield Implementation

2. **Procedural Generation**
   - Noise Functions
   - Terrain Generation
   - FBM

3. **Camera Controls**
   - Spline Paths
   - ScrollTrigger Integration
   - Smooth Transitions

### Phase 3: Specific Scenes (Woche 5-6)

1. **Sternenhimmel**
   - Particle System
   - Twinkle Shader
   - Galaxy Background

2. **Polarlichter**
   - Volumetric Shader
   - Animated Noise
   - Color Gradients

3. **Wüste**
   - Procedural Terrain
   - Sand Shader
   - Atmospheric Lighting

4. **Berge & Wolken**
   - Mountain Generation
   - Volumetric Clouds (Raymarching)
   - Weather System

### Phase 4: Polish & Performance (Woche 7-8)

1. **Post-Processing**
   - Bloom
   - DOF
   - Color Grading

2. **Optimization**
   - LOD
   - Instancing
   - Frustum Culling

3. **Audio Integration**
   - Spatial Audio
   - Audio Analyzer
   - Reactive Visuals

### Phase 5: Production (Woche 9-10)

1. **Responsive Design**
2. **Loading Screen**
3. **Error Handling**
4. **Performance Monitoring**
5. **SEO Optimization**
6. **Cross-browser Testing**
7. **Final Polish**

### Phase 6: Advanced (Optional - darüber hinaus)

**Für erfahrene Entwickler** - siehe [ADVANCED-TECHNIQUES.md](./ADVANCED-TECHNIQUES.md)

1. **WebGPU Migration**
   - WebGPURenderer Setup
   - Compute Shaders
   - Indirect Drawing

2. **GPGPU Techniques**
   - GPU Particle Systems (100k+)
   - Flow Field Simulation
   - GPU-driven Rendering

3. **Photorealistic Rendering**
   - Path Tracing / Ray Tracing
   - Deferred Rendering Pipeline
   - Subsurface Scattering

4. **Advanced Post-Processing**
   - Temporal Anti-Aliasing (TAA)
   - Ground Truth Ambient Occlusion (GTAO)
   - Order Independent Transparency (OIT)

5. **Physics & Interaction**
   - Rapier Physics Engine
   - Realistic Simulations
   - Mesh Deformation

---

## Abschließende Gedanken

Dieses Dokument ist dein **persönlicher Guide** zur Meisterschaft in fotorealistischer 3D-Web-Entwicklung.

### Wichtigste Erfolgsfaktoren:

1. **Konsistenz**: Täglich programmieren, auch wenn nur 1 Stunde
2. **Experimentieren**: Shadertoy, CodePen, eigene Demos
3. **Community**: Three.js Discord, GSAP Forum, Twitter
4. **Inspiration**: Awwwards täglich checken
5. **Performance**: Immer im Hinterkopf behalten
6. **Iteration**: Erste Version wird nicht perfekt sein

### Next Steps:

1. Repository anlegen
2. Vite + Three.js Setup
3. Erste Scene bauen (Sternenhimmel)
4. Shader lernen (Book of Shaders)
5. ScrollTrigger integrieren
6. Jeden Tag komplexer werden

**Du hast alle Tools. Jetzt geht es um Übung, Geduld und Leidenschaft.**

**Let's build something award-winning!**

---

**Zuletzt aktualisiert**: Januar 2025
**Version**: 1.0
**Status**: Ready for implementation
