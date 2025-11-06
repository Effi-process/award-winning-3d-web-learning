# 🏆 ADVANCED AWARD-WINNING 3D WEB EXAMPLES
## Die krassesten WebGL/Three.js Projekte & Techniken 2024

*Dieses Dokument sammelt die modernsten und beeindruckendsten 3D-Web-Techniken, Award-Winning Projects und cutting-edge Implementierungen.*

---

## 📚 INHALT

1. [Award-Winning Studios & Ihre Techniken](#award-winning-studios)
2. [WebGPU - Die Zukunft (2024)](#webgpu-revolution)
3. [React Three Fiber Ecosystem](#react-three-fiber)
4. [Framer Motion + 3D Integration](#framer-motion-3d)
5. [Realistische Rendering-Techniken](#realistic-rendering)
6. [Procedural Generation Meisterwerke](#procedural-generation)
7. [Auto-Konfiguratoren & Produkt-Visualisierung](#product-visualization)
8. [Shader-Techniken der Profis](#shader-techniques)
9. [Performance-Optimierung](#performance-optimization)
10. [Code-Beispiele aus echten Projekten](#real-world-code)

---

## 🎯 AWARD-WINNING STUDIOS {#award-winning-studios}

### Die Top Studios für 3D Web-Experiences

#### **Active Theory**
- **Website**: activetheory.net
- **Awards**: Mehrfache FWA & Awwwards Site of the Day
- **Signature**: Interaktive WebGL Experiences für große Brands
- **Bekannte Projekte**:
  - Google Earth VR Launch
  - Metallica AR Experience
  - Nike Air Max Day

**Ihre Tech-Stack**:
```javascript
- Three.js + Custom WebGL
- GSAP für Animationen
- Custom Shader Pipeline
- Reaktive Audio-Visualisierung
```

#### **Lusion**
- **Website**: lusion.co
- **Specialty**: Ultra-realistische Produkt-Visualisierungen
- **Awards**: Awwwards Site of the Year Nominee
- **Technik**: PBR Materials, IBL Lighting, Custom Post-Processing

#### **14islands**
- **Website**: 14islands.com
- **Fokus**: Performance-optimierte 3D Experiences
- **Known for**: Google Developer Experiences
- **Technik**: React Three Fiber, Next.js, Progressive Loading

---

## 🚀 WEBGPU REVOLUTION {#webgpu-revolution}

### Die nächste Generation: WebGPU (2024)

WebGPU ist **NICHT** mehr experimentell! Three.js hat 2024 vollständige WebGPU-Unterstützung.

#### **Warum WebGPU?**

```
Performance-Vergleich:
┌─────────────────┬──────────┬──────────┐
│                 │  WebGL   │  WebGPU  │
├─────────────────┼──────────┼──────────┤
│ Particles       │  50k     │  100k+   │
│ Draw Calls/Sec  │  ~1000   │  ~5000   │
│ Compute Shader  │  ✗       │  ✓       │
│ Async Compute   │  ✗       │  ✓       │
└─────────────────┴──────────┴──────────┘
```

#### **Setup mit Three.js r160+**

```javascript
import { WebGPURenderer } from 'three/webgpu';
import { MeshBasicNodeMaterial, color, positionWorld } from 'three/nodes';

// WebGPU Renderer erstellen
const renderer = new WebGPURenderer({
  canvas,
  antialias: true,
  forceWebGL: false  // Auto-fallback zu WebGL
});

await renderer.init();

// Three Shading Language (TSL) - Neues Shader-System
const material = new MeshBasicNodeMaterial();
material.colorNode = color(0xff0000).mul(positionWorld.y);

// ✅ Funktioniert mit WebGL UND WebGPU!
```

#### **TSL (Three Shading Language) - Game Changer**

TSL ersetzt GLSL mit JavaScript-ähnlicher Syntax:

```javascript
// Alte GLSL Methode ❌
const vertexShader = `
  varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Neue TSL Methode ✅
import { positionLocal, modelViewProjection } from 'three/nodes';

material.positionNode = modelViewProjection();
const vPosition = positionLocal;  // Einfach verwenden!
```

#### **WebGPU Compute Shaders - Neue Möglichkeiten**

```javascript
import { StorageBufferNode } from 'three/nodes';

// Particle System mit Compute Shader
const particleCount = 1000000;  // 1 Million! 🤯

const computeShader = `
  @group(0) @binding(0) var<storage, read_write> particles: array<vec4f>;

  @compute @workgroup_size(256)
  fn main(@builtin(global_invocation_id) id: vec3u) {
    let index = id.x;
    particles[index].xyz += particles[index].w * deltaTime;
  }
`;

// Performance: 60 FPS mit 1M Partikeln!
```

**Real-World WebGPU Projekt (2024):**
- **Utsubo 2024** - Interactive Audio-Reactive Experience
- 500k+ particles in Echtzeit
- Ambient Occlusion in WebGPU
- TSL-basierte Custom Materials

---

## ⚛️ REACT THREE FIBER ECOSYSTEM {#react-three-fiber}

### React + Three.js = R3F (React Three Fiber)

R3F ist der **Standard** für Three.js in React 2024.

#### **Basis-Setup mit TypeScript**

```typescript
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} />

      {/* 3D Content */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>

      {/* Helpers von Drei */}
      <OrbitControls />
      <Environment preset="sunset" />
    </Canvas>
  )
}
```

#### **@react-three/drei - Die Superpowers**

Drei ist eine Sammlung von nützlichen Helfern:

```typescript
import {
  // 3D Text
  Text3D,
  // Environment Maps
  Environment,
  // HTML in 3D
  Html,
  // Shader-Effekte
  MeshTransmissionMaterial,
  // Particles
  Points,
  // Loading
  useGLTF,
  // und 100+ mehr...
} from '@react-three/drei'

// Beispiel: Glass Material (Transmission)
<mesh>
  <sphereGeometry />
  <MeshTransmissionMaterial
    thickness={0.5}
    roughness={0.2}
    transmission={1}
    ior={1.5}
    chromaticAberration={0.5}
  />
</mesh>
```

#### **@react-three/postprocessing - Instagram für 3D**

```typescript
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'

<Canvas>
  <Scene />

  <EffectComposer>
    <Bloom
      intensity={1.5}
      luminanceThreshold={0.9}
      luminanceSmoothing={0.025}
    />
    <ChromaticAberration offset={[0.002, 0.002]} />
  </EffectComposer>
</Canvas>
```

#### **Performance-Tricks mit R3F**

```typescript
import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'

function ParticleSystem() {
  // Geometry nur einmal erstellen
  const particles = useMemo(() => {
    const temp = new Float32Array(10000 * 3)
    for(let i = 0; i < 10000; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 10
      temp[i * 3 + 1] = (Math.random() - 0.5) * 10
      temp[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return temp
  }, [])

  // Animation Loop - 60 FPS
  useFrame((state, delta) => {
    // state.clock, state.camera, state.scene verfügbar
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} />
    </points>
  )
}
```

---

## 🎨 FRAMER MOTION + 3D INTEGRATION {#framer-motion-3d}

### Framer Motion trifft Three.js

Framer Motion ist die **beste** Animations-Library für React, und funktioniert jetzt mit 3D!

#### **Installation**

```bash
npm install framer-motion framer-motion-3d three @react-three/fiber
```

#### **Basic 3D Animation**

```typescript
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion-3d'

function AnimatedBox() {
  return (
    <motion.mesh
      // Standard Framer Motion Props!
      initial={{ scale: 0, rotateY: 0 }}
      animate={{ scale: 1, rotateY: Math.PI * 2 }}
      transition={{ duration: 2 }}
      // Hover & Tap Animations
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <boxGeometry />
      <meshStandardMaterial color="hotpink" />
    </motion.mesh>
  )
}
```

#### **Scroll-based 3D Animations**

```typescript
import { useScroll, useTransform } from 'framer-motion'
import { motion } from 'framer-motion-3d'

function ScrollScene() {
  const { scrollYProgress } = useScroll()

  // Transform scroll 0-1 zu rotation 0-2π
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 2])
  const positionZ = useTransform(scrollYProgress, [0, 1], [0, -10])

  return (
    <Canvas>
      <motion.mesh
        rotation-y={rotateY}
        position-z={positionZ}
      >
        <torusGeometry args={[1, 0.4, 16, 100]} />
        <meshStandardMaterial color="cyan" />
      </motion.mesh>
    </Canvas>
  )
}
```

#### **Mouse Parallax mit Framer Motion**

```typescript
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'

function MouseParallax() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation
  const rotateX = useSpring(mouseY, { stiffness: 50, damping: 20 })
  const rotateY = useSpring(mouseX, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      mouseX.set(x)
      mouseY.set(y)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <Canvas>
      <motion.group rotation-x={rotateX} rotation-y={rotateY}>
        <mesh>
          <sphereGeometry />
          <meshStandardMaterial />
        </mesh>
      </motion.group>
    </Canvas>
  )
}
```

#### **3D Float Effect (Award-Winning Technique)**

```typescript
// Popularisiert durch Olivier Larose
import { useTransform, useSpring, motion } from 'framer-motion'

function FloatingModel({ mousePosition }) {
  const { x, y } = mousePosition

  // 3D Rotation basierend auf Maus
  const rotateX = useTransform(y, [0, 1], [15, -15])
  const rotateY = useTransform(x, [0, 1], [-15, 15])

  // Translate für Depth
  const translateZ = useTransform(x, [0, 1], [-50, 50])

  // Smooth mit Spring
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 30 })

  return (
    <motion.div
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        translateZ,
        transformStyle: 'preserve-3d'
      }}
    >
      <Canvas>
        {/* 3D Model hier */}
      </Canvas>
    </motion.div>
  )
}
```

---

## 🎥 REALISTISCHE RENDERING-TECHNIKEN {#realistic-rendering}

### PBR (Physically Based Rendering)

#### **IBL (Image Based Lighting) - Der Realismus-Boost**

```javascript
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

// HDR Environment laden
const rgbeLoader = new RGBELoader()
rgbeLoader.load('/hdri/studio.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
  scene.background = texture  // Optional
})

// Oder mit R3F + Drei:
import { Environment } from '@react-three/drei'

<Environment
  files="/hdri/studio.hdr"
  background  // Als Background
  blur={0.5}  // Blur für softes Licht
/>
```

#### **Realistic Materials Setup**

```javascript
const material = new THREE.MeshStandardMaterial({
  map: diffuseTexture,           // Base Color
  normalMap: normalTexture,      // Surface Detail
  roughnessMap: roughnessTexture, // Wie matt/glänzend
  metalnessMap: metalnessTexture, // Wie metallisch
  aoMap: aoTexture,              // Ambient Occlusion (Schatten)
  displacementMap: heightTexture, // Geometry Displacement

  // PBR Values
  metalness: 0.8,
  roughness: 0.2,
  envMapIntensity: 1.0
})
```

#### **Post-Processing für Realismus**

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass'

const composer = new EffectComposer(renderer)

// Base Render
composer.addPass(new RenderPass(scene, camera))

// SSAO (Screen Space Ambient Occlusion)
const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight)
ssaoPass.kernelRadius = 16
ssaoPass.minDistance = 0.005
ssaoPass.maxDistance = 0.1
composer.addPass(ssaoPass)

// Bloom für leuchtende Teile
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
)
composer.addPass(bloomPass)

// Render in Animation Loop
composer.render()
```

#### **Shadows - Realistische Schatten**

```javascript
// Renderer Setup
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap  // Weiche Schatten

// Light mit Shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.castShadow = true

// Shadow Map Quality
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 500

// Optimize Shadow Camera
directionalLight.shadow.camera.left = -50
directionalLight.shadow.camera.right = 50
directionalLight.shadow.camera.top = 50
directionalLight.shadow.camera.bottom = -50

// Mesh Setup
mesh.castShadow = true
mesh.receiveShadow = true
```

---

## 🌍 PROCEDURAL GENERATION MEISTERWERKE {#procedural-generation}

### Terrain Generation mit Shaders

#### **Height Map basiertes Terrain**

```glsl
// Vertex Shader
uniform sampler2D uHeightMap;
varying float vHeight;

void main() {
  vec3 pos = position;

  // Height aus Texture lesen
  float height = texture2D(uHeightMap, uv).r;
  pos.y = height * 50.0;  // Scale

  vHeight = height;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// Fragment Shader - Farbe basierend auf Höhe
varying float vHeight;

void main() {
  vec3 waterColor = vec3(0.1, 0.3, 0.5);
  vec3 sandColor = vec3(0.8, 0.7, 0.5);
  vec3 grassColor = vec3(0.3, 0.6, 0.3);
  vec3 rockColor = vec3(0.5, 0.5, 0.5);
  vec3 snowColor = vec3(1.0, 1.0, 1.0);

  vec3 color;

  if(vHeight < 0.2) {
    color = waterColor;
  } else if(vHeight < 0.3) {
    color = mix(waterColor, sandColor, (vHeight - 0.2) * 10.0);
  } else if(vHeight < 0.5) {
    color = grassColor;
  } else if(vHeight < 0.7) {
    color = mix(grassColor, rockColor, (vHeight - 0.5) * 5.0);
  } else {
    color = mix(rockColor, snowColor, (vHeight - 0.7) * 3.33);
  }

  gl_FragColor = vec4(color, 1.0);
}
```

#### **Perlin Noise Terrain (Full Procedural)**

```javascript
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'

function generateTerrain(width, height, segments) {
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments)
  const perlin = new ImprovedNoise()

  const positions = geometry.attributes.position
  const vertex = new THREE.Vector3()

  for(let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i)

    // Multi-octave Perlin Noise
    let height = 0
    let amplitude = 50
    let frequency = 0.01

    for(let j = 0; j < 4; j++) {
      height += amplitude * perlin.noise(
        vertex.x * frequency,
        vertex.y * frequency,
        0
      )
      amplitude *= 0.5
      frequency *= 2
    }

    positions.setZ(i, height)
  }

  geometry.computeVertexNormals()
  return geometry
}
```

#### **Infinite Terrain mit Chunks**

```typescript
class TerrainChunkManager {
  chunks: Map<string, THREE.Mesh> = new Map()
  chunkSize = 100
  viewDistance = 3

  updateChunks(cameraPosition: THREE.Vector3) {
    const chunkX = Math.floor(cameraPosition.x / this.chunkSize)
    const chunkZ = Math.floor(cameraPosition.z / this.chunkSize)

    // Chunks in View Distance laden
    for(let x = -this.viewDistance; x <= this.viewDistance; x++) {
      for(let z = -this.viewDistance; z <= this.viewDistance; z++) {
        const cx = chunkX + x
        const cz = chunkZ + z
        const key = `${cx},${cz}`

        if(!this.chunks.has(key)) {
          // Neuen Chunk erstellen
          const chunk = this.createChunk(cx, cz)
          this.chunks.set(key, chunk)
          scene.add(chunk)
        }
      }
    }

    // Alte Chunks entfernen
    this.chunks.forEach((chunk, key) => {
      const [cx, cz] = key.split(',').map(Number)
      const distance = Math.max(
        Math.abs(cx - chunkX),
        Math.abs(cz - chunkZ)
      )

      if(distance > this.viewDistance + 1) {
        scene.remove(chunk)
        chunk.geometry.dispose()
        this.chunks.delete(key)
      }
    })
  }

  createChunk(chunkX: number, chunkZ: number): THREE.Mesh {
    const geometry = generateTerrain(
      this.chunkSize,
      this.chunkSize,
      50
    )

    const material = new THREE.MeshStandardMaterial({
      color: 0x3a5f3a,
      roughness: 0.9,
      metalness: 0.1
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(
      chunkX * this.chunkSize,
      0,
      chunkZ * this.chunkSize
    )
    mesh.receiveShadow = true

    return mesh
  }
}
```

---

## 🚗 AUTO-KONFIGURATOREN & PRODUKT-VISUALISIERUNG {#product-visualization}

### Car Configurator Best Practices

#### **Setup für realistic Car Rendering**

```typescript
// 1. Model Loading mit Kompression
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// 2. Car Model laden
gltfLoader.load('/models/car.glb', (gltf) => {
  const car = gltf.scene

  // 3. Materials für Car Paint
  car.traverse((child) => {
    if(child.isMesh && child.name.includes('body')) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,          // Car Paint Gloss
        clearcoatRoughness: 0.1,
        envMapIntensity: 2.0
      })
    }
  })

  scene.add(car)
})
```

#### **Car Color Configurator**

```typescript
interface CarConfig {
  bodyColor: string
  wheelsColor: string
  interiorColor: string
}

class CarConfigurator {
  car: THREE.Group
  bodyMaterial: THREE.MeshPhysicalMaterial

  updateBodyColor(hexColor: string) {
    // Smooth color transition
    gsap.to(this.bodyMaterial.color, {
      r: new THREE.Color(hexColor).r,
      g: new THREE.Color(hexColor).g,
      b: new THREE.Color(hexColor).b,
      duration: 0.5,
      ease: 'power2.inOut'
    })
  }

  takeScreenshot(): string {
    // High-res screenshot
    const originalSize = renderer.getSize(new THREE.Vector2())

    // Render in 4K
    renderer.setSize(3840, 2160)
    renderer.render(scene, camera)

    const screenshot = renderer.domElement.toDataURL('image/png')

    // Restore
    renderer.setSize(originalSize.x, originalSize.y)

    return screenshot
  }

  rotateCamera(angle: number, duration: number = 1) {
    // Smooth camera orbit
    gsap.to(camera.position, {
      x: Math.cos(angle) * 5,
      z: Math.sin(angle) * 5,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(0, 0, 0)
    })
  }
}
```

#### **Interactive Hotspots**

```typescript
import { Html } from '@react-three/drei'

function CarWithHotspots() {
  return (
    <group>
      {/* Car Model */}
      <primitive object={carModel} />

      {/* Hotspots */}
      <Html position={[1.2, 0.5, 0.8]} center>
        <div className="hotspot">
          <h3>LED Headlights</h3>
          <p>Premium Matrix LED Technology</p>
        </div>
      </Html>

      <Html position={[-1.2, 0.5, 0.8]} center>
        <div className="hotspot">
          <h3>20" Alloy Wheels</h3>
          <p>Sport Design Package</p>
        </div>
      </Html>
    </group>
  )
}
```

---

## ⚡ SHADER-TECHNIKEN DER PROFIS {#shader-techniques}

### Advanced GLSL Patterns

#### **Noise Functions Library**

```glsl
// Classic Perlin Noise 2D
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
         (c - a) * u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}

// Simplex Noise 3D (Faster!)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  // Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractal Brownian Motion
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for(int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}
```

#### **Holographic Shader Effect**

```glsl
// Vertex Shader
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shader
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Fresnel Effect
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);

  // Scanning lines
  float scanLine = sin(vPosition.y * 20.0 - uTime * 5.0);
  scanLine = smoothstep(0.3, 0.7, scanLine);

  // Holographic colors
  vec3 color1 = vec3(0.0, 1.0, 1.0);  // Cyan
  vec3 color2 = vec3(1.0, 0.0, 1.0);  // Magenta

  vec3 hologramColor = mix(color1, color2, fresnel);

  // Add scan line
  hologramColor += scanLine * 0.3;

  // Glitch effect
  float glitch = step(0.95, sin(uTime * 20.0 + vPosition.x * 50.0));
  hologramColor += glitch * 0.5;

  // Transparency based on fresnel
  float alpha = fresnel * 0.8 + scanLine * 0.2;

  gl_FragColor = vec4(hologramColor, alpha);
}
```

#### **Water Shader (Realistic)**

```glsl
// Fragment Shader
uniform float uTime;
uniform sampler2D uNormalMap;
uniform vec3 uLightDirection;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Animated UV for normal map
  vec2 uv1 = vUv * 2.0 + vec2(uTime * 0.02, uTime * 0.01);
  vec2 uv2 = vUv * 3.0 - vec2(uTime * 0.03, uTime * 0.02);

  // Sample normal maps
  vec3 normal1 = texture2D(uNormalMap, uv1).rgb * 2.0 - 1.0;
  vec3 normal2 = texture2D(uNormalMap, uv2).rgb * 2.0 - 1.0;

  // Combine normals
  vec3 normal = normalize(normal1 + normal2);

  // Lighting
  float diffuse = max(dot(normal, uLightDirection), 0.0);

  // Specular (Phong)
  vec3 viewDir = normalize(cameraPosition - vPosition);
  vec3 reflectDir = reflect(-uLightDirection, normal);
  float specular = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);

  // Water colors
  vec3 waterColorDeep = vec3(0.0, 0.1, 0.3);
  vec3 waterColorShallow = vec3(0.0, 0.5, 0.7);

  // Depth-based color
  float depth = length(vPosition.xz) * 0.01;
  vec3 waterColor = mix(waterColorShallow, waterColorDeep, depth);

  // Final color
  vec3 finalColor = waterColor * diffuse + vec3(1.0) * specular * 0.5;

  gl_FragColor = vec4(finalColor, 0.9);
}
```

---

## 🎯 PERFORMANCE-OPTIMIERUNG {#performance-optimization}

### Die wichtigsten Performance-Techniken

#### **1. Level of Detail (LOD)**

```javascript
import { LOD } from 'three'

const lod = new LOD()

// High-poly mesh (nah)
const detailMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  material
)
lod.addLevel(detailMesh, 0)

// Medium-poly mesh
const mediumMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  material
)
lod.addLevel(mediumMesh, 50)

// Low-poly mesh (weit weg)
const lowMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 16, 16),
  material
)
lod.addLevel(lowMesh, 100)

scene.add(lod)

// In render loop
lod.update(camera)
```

#### **2. Instancing (Tausende Objekte)**

```javascript
import { InstancedMesh } from 'three'

// Erstelle 10.000 Bäume effizient
const count = 10000
const treeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8)
const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 })

const instancedTrees = new InstancedMesh(treeGeometry, treeMaterial, count)

const matrix = new THREE.Matrix4()
const position = new THREE.Vector3()
const rotation = new THREE.Euler()
const scale = new THREE.Vector3()

for(let i = 0; i < count; i++) {
  // Random position
  position.set(
    (Math.random() - 0.5) * 1000,
    0,
    (Math.random() - 0.5) * 1000
  )

  // Random rotation
  rotation.set(0, Math.random() * Math.PI * 2, 0)

  // Random scale
  const s = 0.5 + Math.random() * 1.5
  scale.set(s, s, s)

  matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale)
  instancedTrees.setMatrixAt(i, matrix)
}

instancedTrees.instanceMatrix.needsUpdate = true
scene.add(instancedTrees)

// Performance: 10k Objekte bei 60 FPS! 🚀
```

#### **3. Frustum Culling Optimization**

```javascript
class OptimizedScene {
  visibleObjects: THREE.Mesh[] = []
  allObjects: THREE.Mesh[] = []

  updateVisibility(camera: THREE.Camera) {
    const frustum = new THREE.Frustum()
    const matrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )
    frustum.setFromProjectionMatrix(matrix)

    this.allObjects.forEach(obj => {
      const inView = frustum.intersectsObject(obj)
      obj.visible = inView

      // Extra: LOD Update nur für sichtbare Objekte
      if(inView && obj.userData.lod) {
        obj.userData.lod.update(camera)
      }
    })
  }
}
```

#### **4. Texture Optimization**

```javascript
// Texture Compression
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'

const ktx2Loader = new KTX2Loader()
ktx2Loader.setTranscoderPath('/basis/')
ktx2Loader.detectSupport(renderer)

// Laden komprimierter Texturen
ktx2Loader.load('/textures/diffuse.ktx2', (texture) => {
  material.map = texture

  // Mipmap settings
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
})

// Texture Atlas für weniger Draw Calls
class TextureAtlas {
  createAtlas(textures: THREE.Texture[]): THREE.Texture {
    const size = 2048
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const atlas = new THREE.CanvasTexture(canvas)

    // Textures im Grid anordnen
    const cols = Math.ceil(Math.sqrt(textures.length))
    const cellSize = size / cols

    textures.forEach((tex, i) => {
      const x = (i % cols) * cellSize
      const y = Math.floor(i / cols) * cellSize
      ctx.drawImage(tex.image, x, y, cellSize, cellSize)
    })

    atlas.needsUpdate = true
    return atlas
  }
}
```

#### **5. Geometry Merging**

```javascript
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

// Viele statische Meshes zu einem zusammenfügen
function mergeStaticMeshes(meshes: THREE.Mesh[]): THREE.Mesh {
  const geometries = meshes.map(mesh => {
    const geo = mesh.geometry.clone()
    geo.applyMatrix4(mesh.matrixWorld)
    return geo
  })

  const mergedGeometry = mergeGeometries(geometries)
  const mergedMesh = new THREE.Mesh(mergedGeometry, meshes[0].material)

  // Performance: 1000 Draw Calls → 1 Draw Call! 🎉
  return mergedMesh
}
```

---

## 💻 CODE-BEISPIELE AUS ECHTEN PROJEKTEN {#real-world-code}

### Award-Winning Patterns

#### **1. Smooth Scroll Integration (Olivier Larose Style)**

```typescript
// Lenis Smooth Scroll + GSAP ScrollTrigger
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false
})

function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

// GSAP + Lenis sync
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

// Scroll-based 3D Animation
gsap.to(model.rotation, {
  y: Math.PI * 2,
  scrollTrigger: {
    trigger: '.section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1
  }
})
```

#### **2. Mouse-following 3D Object**

```typescript
// Award-winning technique for product showcases
class MouseFollowModel {
  model: THREE.Group
  mouse = { x: 0, y: 0 }
  target = { x: 0, y: 0 }

  constructor(model: THREE.Group) {
    this.model = model
    this.setupMouseListener()
  }

  setupMouseListener() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    })
  }

  update() {
    // Smooth lerp
    this.target.x += (this.mouse.x - this.target.x) * 0.05
    this.target.y += (this.mouse.y - this.target.y) * 0.05

    // Rotation
    this.model.rotation.y = this.target.x * 0.5
    this.model.rotation.x = this.target.y * 0.3

    // Position offset
    this.model.position.x = this.target.x * 0.3
    this.model.position.y = this.target.y * 0.3
  }
}
```

#### **3. Magnetic Hover Effect**

```typescript
// Popularisiert durch awwwards.com Websites
class MagneticEffect {
  element: HTMLElement
  bounds: DOMRect

  constructor(element: HTMLElement) {
    this.element = element
    this.bounds = element.getBoundingClientRect()

    element.addEventListener('mouseenter', this.onMouseEnter.bind(this))
    element.addEventListener('mousemove', this.onMouseMove.bind(this))
    element.addEventListener('mouseleave', this.onMouseLeave.bind(this))
  }

  onMouseEnter() {
    this.bounds = this.element.getBoundingClientRect()
  }

  onMouseMove(e: MouseEvent) {
    const x = e.clientX - this.bounds.left - this.bounds.width / 2
    const y = e.clientY - this.bounds.top - this.bounds.height / 2

    // Magnetic strength
    const strength = 0.3

    gsap.to(this.element, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: 'power2.out'
    })
  }

  onMouseLeave() {
    gsap.to(this.element, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)'
    })
  }
}
```

#### **4. Revealing Text Animation (Awwwards Style)**

```typescript
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

class TextReveal {
  reveal(element: HTMLElement) {
    const split = new SplitText(element, { type: 'lines, words, chars' })

    // Wrap lines in overflow hidden divs
    split.lines.forEach(line => {
      const wrapper = document.createElement('div')
      wrapper.style.overflow = 'hidden'
      line.parentNode?.insertBefore(wrapper, line)
      wrapper.appendChild(line)
    })

    // Animate
    gsap.from(split.chars, {
      yPercent: 100,
      opacity: 0,
      duration: 0.8,
      ease: 'power4.out',
      stagger: 0.02,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      }
    })
  }
}
```

---

## 🎓 LEARNING RESOURCES

### Top Kurse & Tutorials 2024

1. **Three.js Journey** von Bruno Simon
   - https://threejs-journey.com
   - 15+ Stunden Video
   - 70+ Lektionen
   - Von Basics bis WebGPU
   - **Best Investment!** 💎

2. **Awwwards Courses**
   - Advanced WebGL
   - Shader Programming
   - Performance Optimization

3. **YouTube Channels**:
   - **Yuri Artiukh** - Advanced Three.js
   - **Simon Dev** - Game Development Patterns
   - **Bruno Simon** - Three.js Tips

4. **Blogs**:
   - **blog.olivierlarose.com** - Modern Patterns
   - **tympanus.net/codrops** - Cutting-edge Demos

### Communities

- **Three.js Discord**: 50k+ members
- **Awwwards Forum**: Networking mit Profis
- **Reddit r/threejs**: Daily Inspiration

---

## 🚀 NÄCHSTE SCHRITTE

### Project Ideas zum Lernen

1. **Beginner**: Interaktives Portfolio
2. **Intermediate**: Product Configurator
3. **Advanced**: Multiplayer 3D Game
4. **Expert**: Procedural World Generator

### Tech Stack Empfehlung 2024

```typescript
// Perfect Stack für moderne 3D Websites
{
  "framework": "Next.js 14",
  "3d": "React Three Fiber + Drei",
  "animation": "Framer Motion + GSAP",
  "styling": "Tailwind CSS",
  "state": "Zustand",
  "deployment": "Vercel"
}
```

---

## 📝 ZUSAMMENFASSUNG

Die wichtigsten Erkenntnisse:

1. **WebGPU ist da** - Start migrating!
2. **R3F ist Standard** - Für React Projects
3. **Framer Motion** - Beste Animation Library
4. **Performance ist KEY** - Instancing, LOD, Compression
5. **Shaders = Superpowers** - Lerne GLSL!
6. **Community** - Folge den Profis, lerne von den Besten

---

*Dieses Dokument wird ständig aktualisiert mit den neuesten Techniken und Projekten. Stay creative! 🎨*

**Stand**: November 2024
