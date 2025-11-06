# Quick Reference Guide
## Three.js, GSAP & Shader-Programmierung

---

## Three.js Essentials

### Basis Setup
```javascript
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

camera.position.z = 5;
```

### Animation Loop
```javascript
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Updates here

  renderer.render(scene, camera);
}

animate();
```

### Geometries Quick Reference
```javascript
// Basic Shapes
new THREE.BoxGeometry(1, 1, 1);
new THREE.SphereGeometry(1, 32, 32);
new THREE.PlaneGeometry(1, 1, 32, 32);
new THREE.CylinderGeometry(1, 1, 2, 32);
new THREE.TorusGeometry(1, 0.4, 16, 100);

// Custom Buffer Geometry
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  -1, -1, 0,
   1, -1, 0,
   1,  1, 0
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
```

### Materials Quick Reference
```javascript
// Basic
new THREE.MeshBasicMaterial({ color: 0xff0000 });

// Standard (PBR)
new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.5,
  metalness: 0.5
});

// Physical (Advanced PBR)
new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.5,
  metalness: 0.5,
  transmission: 0.5,
  thickness: 1.0
});

// Shader Material
new THREE.ShaderMaterial({
  vertexShader: vertexCode,
  fragmentShader: fragmentCode,
  uniforms: { uTime: { value: 0 } }
});
```

### Lights Quick Reference
```javascript
// Ambient Light
new THREE.AmbientLight(0xffffff, 0.5);

// Directional Light (Sun)
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
dirLight.castShadow = true;

// Point Light
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, 0);

// Spot Light
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(0, 10, 0);
spotLight.angle = Math.PI / 6;
```

---

## GSAP Essentials

### Basic Tween
```javascript
gsap.to(element, {
  x: 100,
  duration: 1,
  ease: "power2.inOut"
});
```

### Timeline
```javascript
const tl = gsap.timeline();

tl.to(element1, { x: 100, duration: 1 })
  .to(element2, { y: 100, duration: 1 }, "-=0.5") // Overlap
  .to(element3, { rotation: 360, duration: 1 });
```

### ScrollTrigger
```javascript
gsap.registerPlugin(ScrollTrigger);

gsap.to(element, {
  scrollTrigger: {
    trigger: ".container",
    start: "top center",
    end: "bottom top",
    scrub: true,
    pin: true,
    markers: true // Debug
  },
  x: 100,
  rotation: 360
});
```

### Camera Animation
```javascript
gsap.to(camera.position, {
  x: 10,
  y: 5,
  z: 20,
  duration: 2,
  ease: "power2.inOut",
  onUpdate: () => {
    camera.lookAt(target);
  }
});
```

---

## GLSL Shader Basics

### Vertex Shader Template
```glsl
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normal;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

### Fragment Shader Template
```glsl
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vec3 color = vec3(vUv, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
```

### Noise Functions
```glsl
// Random
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D Noise (Simple)
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// FBM (Fractal Brownian Motion)
float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 6; i++) {
    value += amplitude * noise(st);
    st *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}
```

### Useful GLSL Functions
```glsl
// Remap
float remap(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

// Circle
float circle(vec2 st, vec2 center, float radius) {
  float dist = length(st - center);
  return 1.0 - smoothstep(radius - 0.01, radius + 0.01, dist);
}

// Rotation 2D
vec2 rotate2D(vec2 st, float angle) {
  st -= 0.5;
  st = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * st;
  st += 0.5;
  return st;
}

// SDF Sphere
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}
```

---

## Performance Snippets

### Instancing
```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);

const matrix = new THREE.Matrix4();
for (let i = 0; i < 1000; i++) {
  matrix.setPosition(
    Math.random() * 10 - 5,
    Math.random() * 10 - 5,
    Math.random() * 10 - 5
  );
  instancedMesh.setMatrixAt(i, matrix);
}

scene.add(instancedMesh);
```

### LOD
```javascript
const lod = new THREE.LOD();

lod.addLevel(highDetailMesh, 0);
lod.addLevel(mediumDetailMesh, 20);
lod.addLevel(lowDetailMesh, 50);

scene.add(lod);
```

### Texture Optimization
```javascript
const texture = textureLoader.load('texture.jpg');
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
```

---

## Post-Processing

### Basic Setup
```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // strength
  0.4, // radius
  0.85 // threshold
);
composer.addPass(bloomPass);

// In animation loop:
composer.render();
```

---

## Common Patterns

### Resize Handler
```javascript
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
});
```

### Mouse Position
```javascript
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
```

### Raycasting
```javascript
const raycaster = new THREE.Raycaster();

function checkIntersection() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    console.log('Hit:', intersects[0].object);
  }
}
```

---

## Easing Functions Reference

```javascript
// GSAP Built-in Easings
"none"
"power1.in" / "power1.out" / "power1.inOut"
"power2.in" / "power2.out" / "power2.inOut"
"power3.in" / "power3.out" / "power3.inOut"
"power4.in" / "power4.out" / "power4.inOut"
"back.in" / "back.out" / "back.inOut"
"elastic.in" / "elastic.out" / "elastic.inOut"
"bounce.in" / "bounce.out" / "bounce.inOut"
"circ.in" / "circ.out" / "circ.inOut"
"expo.in" / "expo.out" / "expo.inOut"
"sine.in" / "sine.out" / "sine.inOut"

// Custom Cubic Bezier
"cubic-bezier(0.4, 0, 0.2, 1)"
```

---

## Debugging

### Stats.js
```javascript
import Stats from 'three/examples/jsm/libs/stats.module.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  stats.begin();
  // render
  stats.end();
}
```

### GUI Controls (lil-gui)
```javascript
import GUI from 'lil-gui';

const gui = new GUI();

const params = {
  color: 0xff0000,
  speed: 1.0
};

gui.addColor(params, 'color').onChange((value) => {
  material.color.set(value);
});

gui.add(params, 'speed', 0, 5).step(0.1);
```

### ScrollTrigger Markers
```javascript
scrollTrigger: {
  markers: true, // Shows start/end lines
  id: "myTrigger" // Custom label
}
```

---

## Color Utilities

### Three.js Colors
```javascript
// Hexadecimal
new THREE.Color(0xff0000);

// RGB (0-1)
new THREE.Color(1, 0, 0);

// String
new THREE.Color('red');
new THREE.Color('#ff0000');
new THREE.Color('rgb(255, 0, 0)');

// HSL
const color = new THREE.Color();
color.setHSL(0.6, 1.0, 0.5);

// Lerp
const colorA = new THREE.Color(0xff0000);
const colorB = new THREE.Color(0x0000ff);
const colorC = new THREE.Color().lerpColors(colorA, colorB, 0.5);
```

---

## Loading Assets

### Texture Loader
```javascript
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('texture.jpg',
  // onLoad
  (texture) => { console.log('Loaded'); },
  // onProgress
  (xhr) => { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
  // onError
  (error) => { console.error('Error loading texture'); }
);
```

### GLTF Loader
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('model.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

### HDR Loader
```javascript
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const rgbeLoader = new RGBELoader();
rgbeLoader.load('environment.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});
```

---

## Math Utilities

### Vector Operations
```javascript
const v = new THREE.Vector3(1, 2, 3);

v.length();              // Magnitude
v.normalize();           // Unit vector
v.add(new THREE.Vector3(1, 0, 0));
v.sub(new THREE.Vector3(0, 1, 0));
v.multiply(new THREE.Vector3(2, 2, 2));
v.cross(new THREE.Vector3(0, 1, 0));
v.dot(new THREE.Vector3(1, 0, 0));
v.lerp(new THREE.Vector3(5, 5, 5), 0.5);
```

### Common Math
```javascript
THREE.MathUtils.degToRad(90);  // 90° to radians
THREE.MathUtils.radToDeg(Math.PI / 2);  // radians to 90°
THREE.MathUtils.clamp(value, min, max);
THREE.MathUtils.lerp(start, end, t);
THREE.MathUtils.smoothstep(x, min, max);
THREE.MathUtils.randFloat(low, high);
THREE.MathUtils.randFloatSpread(range);  // -range/2 to range/2
```

---

**Quick Tip**: Bookmark this page für schnellen Zugriff während des Codens!
