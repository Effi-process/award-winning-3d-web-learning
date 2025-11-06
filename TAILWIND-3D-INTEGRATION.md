# Tailwind CSS + 3D Integration
## Moderne Web-Erlebnisse: Tailwind + Three.js / WebGL

---

## Übersicht

Die Kombination von Tailwind CSS mit 3D-Technologien ermöglicht:
- Moderne, responsive UI-Overlays
- Glassmorphism-Effekte über 3D-Szenen
- Nahtlose Integration von 2D-UI und 3D-Content
- Performance-optimierte Layouts

---

## Setup: Tailwind + Three.js (Vanilla)

### Projekt Setup
```bash
# Vite + Three.js + Tailwind
npm create vite@latest my-3d-app -- --template vanilla
cd my-3d-app
npm install three gsap lenis
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Konfiguration

#### tailwind.config.js
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'glass': 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
```

#### src/style.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply m-0 overflow-hidden;
  }
}

@layer components {
  .glass-card {
    @apply bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl;
  }

  .btn-3d {
    @apply bg-gradient-to-br from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95;
  }
}
```

---

## Pattern 1: Vollbild 3D mit UI-Overlay

### HTML
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Experience</title>
</head>
<body>
  <!-- 3D Canvas -->
  <canvas id="webgl" class="fixed inset-0 w-full h-full"></canvas>

  <!-- UI Overlay -->
  <div class="fixed inset-0 pointer-events-none">
    <!-- Header -->
    <header class="p-8 flex justify-between items-center pointer-events-auto">
      <div class="glass-card">
        <h1 class="text-2xl font-bold text-white">Logo</h1>
      </div>
      <nav class="glass-card">
        <ul class="flex gap-6 text-white">
          <li><a href="#" class="hover:text-blue-400 transition-colors">Home</a></li>
          <li><a href="#" class="hover:text-blue-400 transition-colors">About</a></li>
          <li><a href="#" class="hover:text-blue-400 transition-colors">Contact</a></li>
        </ul>
      </nav>
    </header>

    <!-- Hero Content -->
    <div class="flex items-center justify-center h-full pointer-events-auto">
      <div class="text-center max-w-4xl px-8">
        <h1 class="text-6xl md:text-8xl font-bold text-white mb-6 animate-fadeIn">
          3D Experience
        </h1>
        <p class="text-xl md:text-2xl text-white/80 mb-8">
          Interaktive 3D-Welten mit modernem Design
        </p>
        <button class="btn-3d">
          Explore
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="absolute bottom-8 left-0 right-0 text-center pointer-events-auto">
      <div class="glass-card inline-block">
        <p class="text-white/60 text-sm">Scroll to explore</p>
      </div>
    </footer>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### JavaScript (src/main.js)
```js
import * as THREE from 'three'
import './style.css'

// Scene Setup
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#webgl'),
  antialias: true,
  alpha: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Simple Mesh
const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16)
const material = new THREE.MeshNormalMaterial()
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

camera.position.z = 5

// Animation
function animate() {
  requestAnimationFrame(animate)
  mesh.rotation.x += 0.01
  mesh.rotation.y += 0.01
  renderer.render(scene, camera)
}

animate()

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
```

---

## Pattern 2: React Three Fiber + Tailwind

### Setup
```bash
npm create vite@latest my-r3f-app -- --template react
cd my-r3f-app
npm install three @react-three/fiber @react-three/drei
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### App.jsx
```jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useState } from 'react'

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <torusKnotGeometry args={[1, 0.3, 100, 16]} />
        <meshStandardMaterial color="#7C3AED" />
      </mesh>
      <OrbitControls />
      <Environment preset="sunset" />
    </>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative w-full h-screen">
      {/* 3D Canvas */}
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 0, 5], fov: 75 }}
      >
        <Scene />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header */}
        <header className="p-6 md:p-8 flex justify-between items-center pointer-events-auto">
          <div className="glass-card">
            <h1 className="text-xl md:text-2xl font-bold text-white">
              3D Portfolio
            </h1>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="glass-card px-4 py-2"
          >
            <span className="text-white">Menu</span>
          </button>
        </header>

        {/* Side Menu */}
        <div
          className={`
            fixed top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-xl
            transform transition-transform duration-300 pointer-events-auto
            ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="p-8">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white text-2xl mb-8"
            >
              ✕
            </button>
            <nav className="space-y-4">
              <a href="#" className="block text-white text-xl hover:text-blue-400 transition-colors">
                Home
              </a>
              <a href="#" className="block text-white text-xl hover:text-blue-400 transition-colors">
                Projects
              </a>
              <a href="#" className="block text-white text-xl hover:text-blue-400 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex items-center justify-center h-full px-8 pointer-events-auto">
          <div className="text-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6">
              Creative
              <span className="block bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                3D Developer
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Building immersive web experiences with Three.js and modern design
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn-3d">
                View Work
              </button>
              <button className="glass-card px-8 py-3 text-white font-bold hover:bg-white/20 transition-all">
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
```

---

## Pattern 3: Scroll-basierte 3D-Interaktionen

### Setup mit GSAP ScrollTrigger
```bash
npm install gsap
```

### App.jsx
```jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function AnimatedMesh() {
  const meshRef = useRef()

  useEffect(() => {
    // 3D Animation beim Scrollen
    gsap.to(meshRef.current.rotation, {
      y: Math.PI * 2,
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    })

    gsap.to(meshRef.current.position, {
      z: 2,
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    })
  }, [])

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#7C3AED" />
    </mesh>
  )
}

function App() {
  return (
    <div className="relative">
      {/* Fixed 3D Canvas */}
      <div className="fixed inset-0 w-full h-screen">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <AnimatedMesh />
        </Canvas>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 pointer-events-none">
        {/* Section 1 */}
        <section className="h-screen flex items-center justify-center">
          <div className="glass-card max-w-2xl pointer-events-auto">
            <h2 className="text-4xl font-bold text-white mb-4">
              Section 1
            </h2>
            <p className="text-white/80">
              Scroll und beobachte die 3D-Animation
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="h-screen flex items-center justify-center">
          <div className="glass-card max-w-2xl pointer-events-auto">
            <h2 className="text-4xl font-bold text-white mb-4">
              Section 2
            </h2>
            <p className="text-white/80">
              Das 3D-Objekt rotiert beim Scrollen
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="h-screen flex items-center justify-center">
          <div className="glass-card max-w-2xl pointer-events-auto">
            <h2 className="text-4xl font-bold text-white mb-4">
              Section 3
            </h2>
            <p className="text-white/80">
              Ende der Scroll-Animation
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
```

---

## Pattern 4: 3D Card Hover Effects

### CardGrid.jsx
```jsx
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'

function Card3D({ title, description, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="group relative h-80 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <mesh rotation={[0, index * 0.5, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
              color={hovered ? '#7C3AED' : '#3B82F6'}
            />
          </mesh>
        </Canvas>
      </div>

      {/* Card Content */}
      <div className="relative h-full flex flex-col justify-end p-6">
        <div className={`
          glass-card transition-all duration-300
          ${hovered ? 'bg-white/20 scale-105' : 'bg-white/10'}
        `}>
          <h3 className="text-2xl font-bold text-white mb-2">
            {title}
          </h3>
          <p className="text-white/80">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const cards = [
    { title: 'Project 1', description: 'Amazing 3D experience' },
    { title: 'Project 2', description: 'Interactive visualization' },
    { title: 'Project 3', description: 'Immersive storytelling' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-bold text-white mb-12 text-center">
          3D Projects
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Card3D
              key={index}
              index={index}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
```

---

## Tailwind Utilities für 3D-UI

### Custom Utilities
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // Glassmorphism
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },

      // 3D Transform Utilities
      transformStyle: {
        '3d': 'preserve-3d',
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },

      // Animations
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'rotate-3d': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'rotate-3d': 'rotate-3d 10s linear infinite',
      },
    },
  },
  plugins: [
    // Custom 3D Plugin
    function({ addUtilities }) {
      addUtilities({
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.perspective-1000': {
          'perspective': '1000px',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
      })
    },
  ],
}
```

---

## Responsive 3D Layout

### Beispiel: Mobile-Optimiert
```jsx
function ResponsiveScene() {
  return (
    <div className="relative w-full">
      {/* Mobile: Kleinere Höhe */}
      <div className="h-[50vh] md:h-screen w-full">
        <Canvas>
          <Scene />
        </Canvas>
      </div>

      {/* Mobile: Content unten */}
      <div className="md:absolute md:inset-0 md:pointer-events-none">
        <div className="
          container mx-auto px-4 py-8
          md:h-full md:flex md:items-center
          md:pointer-events-auto
        ">
          <div className="
            bg-white md:bg-white/10 md:backdrop-blur-lg
            p-6 rounded-2xl
            max-w-lg
          ">
            <h1 className="text-3xl md:text-5xl font-bold text-black md:text-white mb-4">
              Responsive 3D
            </h1>
            <p className="text-gray-600 md:text-white/80">
              Optimiert für alle Geräte
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Performance-Tipps

### 1. Lazy Loading
```jsx
import { Suspense, lazy } from 'react'

const Scene3D = lazy(() => import('./Scene3D'))

function App() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="glass-card">
          <p className="text-white">Loading 3D...</p>
        </div>
      </div>
    }>
      <Scene3D />
    </Suspense>
  )
}
```

### 2. Pointer-Events Optimierung
```html
<!-- Nur interaktive Elemente bekommen pointer-events -->
<div class="fixed inset-0 pointer-events-none">
  <button class="pointer-events-auto glass-card">
    Click me
  </button>
</div>
```

### 3. Will-Change für Animationen
```html
<div class="will-change-transform hover:scale-105">
  Animated Element
</div>
```

---

## Best Practices

### ✅ Do's
1. Nutze `pointer-events-none` auf Overlay-Containern
2. Aktiviere `pointer-events-auto` nur auf interaktiven Elementen
3. Verwende Glassmorphism für moderne UI über 3D
4. Mobile-First: Reduzierte 3D-Komplexität auf Mobile
5. Lazy Loading für 3D-Szenen

### ❌ Don'ts
1. Keine z-index-Battles (nutze fixed/absolute richtig)
2. Vermeide zu viele Backdrop-Blur-Elemente (Performance!)
3. Keine schweren Animationen auf Mobile
4. Nicht 100% Opacity bei Overlays (3D nicht sichtbar)

---

## Inspirations-Beispiele

### 1. Apple-Style Produktseite
```jsx
<div className="relative">
  <Canvas className="fixed inset-0" />

  <div className="relative z-10 space-y-screen">
    <section className="h-screen flex items-center justify-center">
      <h1 className="text-7xl font-bold text-white">
        iPhone 15 Pro
      </h1>
    </section>

    <section className="h-screen flex items-center">
      <div className="glass-card max-w-xl ml-auto mr-24">
        <h2 className="text-4xl font-bold text-white mb-4">
          Titanium Design
        </h2>
        <p className="text-white/80">
          Das stärkste iPhone aller Zeiten
        </p>
      </div>
    </section>
  </div>
</div>
```

### 2. Portfolio Hero
```jsx
<div className="relative w-full h-screen">
  <Canvas className="absolute inset-0" />

  <div className="relative z-10 h-full flex items-center justify-center">
    <div className="text-center space-y-8">
      <h1 className="text-8xl font-bold">
        <span className="text-white">Creative</span>
        <span className="block bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Developer
        </span>
      </h1>

      <div className="flex gap-4 justify-center">
        <button className="btn-3d">View Work</button>
        <button className="glass-card px-8 py-3 text-white">
          Contact
        </button>
      </div>
    </div>
  </div>

  <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
    <div className="glass-card animate-bounce">
      <svg className="w-6 h-6 text-white" />
    </div>
  </div>
</div>
```

---

## Tools & Resources

### UI-Component-Libraries mit 3D-Support
- **Aceternity UI**: https://ui.aceternity.com/ (Tailwind + 3D Effects)
- **Magic UI**: https://magicui.design/ (Framer Motion + Tailwind)

### Inspirationen
- **Awwwards**: https://www.awwwards.com/websites/3d/
- **Codrops**: https://tympanus.net/codrops/

### Templates
- **Three.js + Tailwind Starter**: https://github.com/examples/threejs-tailwind

---

## Zusammenfassung

Tailwind CSS + 3D ermöglicht:
- Schnelles Prototyping moderner 3D-Web-Erlebnisse
- Responsive, zugängliche UI-Overlays
- Glassmorphism & moderne Design-Patterns
- Performance-optimierte Layouts

**Nächste Schritte**:
1. Experimentiere mit den Patterns
2. Kombiniere mit GSAP für Animationen
3. Baue dein erstes 3D-Portfolio

---

**Zuletzt aktualisiert**: Januar 2025
