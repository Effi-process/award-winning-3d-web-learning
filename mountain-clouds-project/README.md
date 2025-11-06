# 🏔️ Mountain & Clouds - Cinematic 3D Experience

Eine **award-würdige**, fotorealistische 3D-Website mit proceduralem Berg, volumetrischen Wolken und cinematischen Scroll-Animationen.

![Preview](preview.jpg)

---

## ✨ Features

### 🎨 Visuelle Highlights
- **Procedural Mountain Generation** - Realistische Berg-Geometrie mit Multi-Octave Perlin Noise
- **Volumetric Clouds** - Shader-basierte, volumetrische Wolken mit Fractal Brownian Motion
- **Atmospheric Fog** - Realistische Tiefen-Nebeleffekte
- **Snow-Line Shader** - Dynamische Schnee-Verteilung basierend auf Höhe und Neigung
- **Multi-Layer Depth** - Wolken vor und hinter dem Berg für räumliche Tiefe

### 🎬 Interaktivität
- **Smooth Scroll** - Lenis für butterweiche Scroll-Experience
- **GSAP ScrollTrigger** - Cinematische Kamerafahrten beim Scrollen
- **Mouse Interaction** - Subtile Kamera-Rotation mit Maus
- **Navigation Dots** - Elegante Section-Navigation
- **Responsive** - Funktioniert auf Desktop & Mobile

### ⚡ Performance
- **Optimierte Shader** - GLSL Fragment/Vertex Shaders
- **Fog Culling** - Objekte außerhalb der Sicht werden ausgeblendet
- **Adaptive Quality** - Automatische Anpassung an Gerät

---

## 🚀 Quick Start

### Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Browser öffnet automatisch auf http://localhost:3000
```

### Build für Production

```bash
npm run build
npm run preview
```

---

## 📁 Projektstruktur

```
mountain-clouds-project/
├── src/
│   ├── main.js                      # Haupt-JavaScript mit Three.js Setup
│   └── shaders/
│       ├── mountain/
│       │   ├── vertex.glsl          # Mountain Vertex Shader
│       │   └── fragment.glsl        # Mountain Fragment Shader (Snow/Rock)
│       └── clouds/
│           ├── vertex.glsl          # Cloud Vertex Shader
│           └── fragment.glsl        # Volumetric Cloud Fragment Shader
├── index.html                       # HTML mit minimalistischem Design
├── package.json                     # Dependencies
├── vite.config.js                   # Vite Configuration
└── README.md                        # Diese Datei
```

---

## 🛠️ Technologie-Stack

### Core
- **Three.js** (0.160+) - 3D Rendering Engine
- **GSAP** (3.12+) - Animations & ScrollTrigger
- **Lenis** (1.0+) - Smooth Scroll
- **Vite** (5.0+) - Build Tool & Dev Server
- **vite-plugin-glsl** - GLSL Shader Import

### Shaders
- **GLSL** - OpenGL Shading Language
- **Custom Vertex/Fragment Shaders** für Berg & Wolken

---

## 🎨 Wie es funktioniert

### 1. Procedural Mountain Generation

Der Berg wird vollständig prozedural generiert mit:

```javascript
// Multi-Octave Perlin Noise für realistische Höhen
height = noise(x, y) * 60        // Große Berge
       + noise(x*2, y*2) * 30    // Medium Details
       + noise(x*6, y*6) * 10    // Feine Details (Felsen)
```

**Techniken**:
- Perlin Noise für organische Formen
- Multiple Octaves für verschiedene Detail-Level
- Center Peak für markanten Gipfel
- Power Function für scharfe Grate

### 2. Snow-Line Shader

Der Schnee wird im Shader berechnet:

```glsl
// Schnee basierend auf Höhe
float snowMix = smoothstep(60.0, 70.0, elevation);

// Weniger Schnee auf steilen Hängen
float slope = dot(normal, vec3(0, 1, 0));
snowMix *= smoothstep(0.3, 0.7, slope);
```

**Effekte**:
- Höhenabhängige Schneeverteilung
- Hangneigung berücksichtigt
- Procedural Noise für Textur-Variation
- Atmospheric Lighting

### 3. Volumetric Clouds

Wolken nutzen **Fractal Brownian Motion** (FBM):

```glsl
float fbm(vec3 p) {
  float value = 0.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
```

**Features**:
- 3D Noise für volumetrische Dichte
- Animated mit Zeit-Offset
- Edge Fade für weiche Ränder
- Distance Fog für Realismus

### 4. Camera Animations

GSAP ScrollTrigger für cinematische Fahrten:

```javascript
gsap.to(camera.position, {
  scrollTrigger: {
    trigger: section,
    scrub: 2        // Smooth binding an Scroll
  },
  y: 80 - index * 20,
  z: 300 - index * 80
});
```

**Sections**:
1. **MONTFORT** - Weitwinkel-Ansicht
2. **PEAKS** - Nah am Gipfel
3. **ETHEREAL** - Durch die Wolken

---

## 🎨 Anpassungen

### Farben ändern

**index.html** - CSS:
```css
/* Hintergrund */
background: #e8e8e8;

/* Text */
color: rgba(255, 255, 255, 0.9);
```

**main.js**:
```javascript
// Fog/Sky Color
scene.fog = new THREE.FogExp2(0xe8e8e8, 0.008);
renderer.setClearColor(0xe8e8e8, 1);
```

### Berg-Höhe anpassen

**main.js** - `ProceduralMountain.create()`:
```javascript
// Amplitude ändern für höhere/niedrigere Berge
let amplitude = 60;  // Erhöhen für höher
```

### Schnee-Linie ändern

**main.js** - Mountain Material:
```javascript
uSnowLine: { value: 60.0 }  // Höher = weniger Schnee
```

### Wolken-Dichte

**shaders/clouds/fragment.glsl**:
```glsl
// Threshold für mehr/weniger Wolken
density = smoothstep(0.3, 0.7, density);  // 0.3 -> 0.5 für mehr Wolken
```

### Scroll-Geschwindigkeit

**main.js** - Lenis:
```javascript
duration: 1.5,  // Höher = langsamer
```

---

## 📱 Mobile Optimierung

- **Automatische Qualitätsanpassung** via `devicePixelRatio`
- **Touch-freundliche Navigation** mit Dots
- **Responsive Typography** mit `clamp()`
- **Optimierte Shader** für Mobile GPUs

Für bessere Mobile Performance:
```javascript
// Weniger Wolken auf Mobile
const isMobile = window.innerWidth < 768;
const cloudCount = isMobile ? 5 : 8;
```

---

## 🔧 Troubleshooting

### Schwarzer Bildschirm?
- Browser-Konsole öffnen (F12) für Fehler
- WebGL Support prüfen: https://get.webgl.org/
- Hardware-Beschleunigung aktiviert?

### Performance-Probleme?
```javascript
// In main.js - Weniger Wolken
{ count: 4, y: 120, ... },  // Statt 8

// Niedrigere Geometrie-Auflösung
new THREE.PlaneGeometry(400, 400, 128, 128); // Statt 256, 256
```

### Keine Animationen?
- `npm install` ausgeführt?
- GSAP korrekt importiert?
- Browser-Konsole für Errors checken

---

## 🎓 Lernressourcen

Diese Techniken werden verwendet:

### Procedural Generation
- **Perlin Noise** - Organic terrain generation
- **Fractal Brownian Motion** - Multi-octave detail
- **Height Map Deformation** - Vertex displacement

### Shader Programming
- **GLSL Fragment Shaders** - Per-pixel rendering
- **Vertex Shaders** - Geometry transformation
- **Uniforms** - Dynamic parameters
- **Varyings** - Vertex-to-Fragment data

### Animation
- **GSAP ScrollTrigger** - Scroll-based animations
- **Lenis Smooth Scroll** - Butter-smooth scrolling
- **Camera Interpolation** - Smooth transitions

### Mehr lernen?
- **Three.js Journey**: https://threejs-journey.com/
- **The Book of Shaders**: https://thebookofshaders.com/
- **Shadertoy**: https://www.shadertoy.com/

---

## 🌟 Erweiterungsmöglichkeiten

### Easy
- [ ] **Day/Night Cycle** - Sonnenuntergang mit Sky Shader
- [ ] **Different Mountains** - Andere Noise-Parameter
- [ ] **More Sections** - Zusätzliche Scroll-Sections
- [ ] **Sound Design** - Spatial Audio mit Wind

### Medium
- [ ] **Raymarched Clouds** - Echtes Volumetric Raymarching
- [ ] **Snow Particles** - GPU Particle System
- [ ] **Birds Flying** - Animated Flock
- [ ] **Distance Blur** - Depth of Field Post-Processing

### Advanced
- [ ] **Path Tracing** - Photorealistic Global Illumination
- [ ] **WebGPU** - Next-Gen Performance
- [ ] **Physics** - Interactive Rock Falls
- [ ] **Weather System** - Dynamic Storms & Lightning

---

## 🏆 Award-Winning Tips

### Für Awwwards/FWA Submission:

1. **Add Loading Experience** - Animated Progress Bar
2. **Sound Design** - Subtle Ambient Audio
3. **Mobile Gestures** - Swipe Interactions
4. **Microinteractions** - Hover Effects auf Text
5. **About Modal** - Info über das Projekt
6. **Social Sharing** - Meta Tags optimieren

### Performance Checklist:
- ✅ 60 FPS on Desktop
- ✅ 30+ FPS on Mobile
- ✅ < 3s Loading Time
- ✅ Smooth Scrolling
- ✅ No Jank

### Visual Checklist:
- ✅ Photorealistic Materials
- ✅ Atmospheric Fog
- ✅ Cinematic Camera Moves
- ✅ Subtle Animations
- ✅ Typography Hierarchy

---

## 📝 Credits & Inspiration

### Inspiration
- **mont-fort.com** - Minimalist Mountain Design
- **Awwwards** - 3D Website Inspiration
- **Shadertoy** - Shader Techniques

### Technologies
- **Three.js Team** - Amazing 3D Library
- **GreenSock** - Best Animation Library
- **Lenis** - Smooth Scroll

---

## 📄 Lizenz

Dieses Projekt dient als **Lern-Beispiel** und ist frei verwendbar für persönliche Projekte.

**Hinweis**: Kommerzielle Nutzung auf eigene Verantwortung. Respektiere Copyright bei Verwendung.

---

## 🚀 Los geht's!

```bash
npm install
npm run dev
```

**Viel Erfolg beim Erstellen deiner award-würdigen Website!** 🏔️☁️

---

**Built with ❤️ and Three.js**

**Questions?** Check the documentation files in the parent directory:
- [AWARD-WINNING-3D-WEB-MASTERY.md](../AWARD-WINNING-3D-WEB-MASTERY.md)
- [ADVANCED-TECHNIQUES.md](../ADVANCED-TECHNIQUES.md)
- [QUICK-REFERENCE.md](../QUICK-REFERENCE.md)
