# Advanced 3D Web Development Techniques
## Fortgeschrittene Methoden für Award-Winning Websites

---

## Inhaltsverzeichnis

1. [WebGPU & Next-Gen Rendering](#webgpu--next-gen-rendering)
2. [Fortgeschrittene Shader-Techniken](#fortgeschrittene-shader-techniken)
3. [GPU-Driven Rendering](#gpu-driven-rendering)
4. [Fotorealistische Rendering-Techniken](#fotorealistische-rendering-techniken)
5. [Fortgeschrittenes Post-Processing](#fortgeschrittenes-post-processing)
6. [Physics & Interaktivität](#physics--interaktivität)
7. [Mesh-Deformation & Animation](#mesh-deformation--animation)
8. [Optimierung & Performance](#optimierung--performance)

---

## WebGPU & Next-Gen Rendering

### Migration von WebGL zu WebGPU

#### Vorteile von WebGPU
- **30-40% bessere GPU-Auslastung** in vielen Szenarien
- **Compute Shaders** für GPGPU-Berechnungen
- **Indirekte Draw Calls** für GPU-gesteuerte Rendering
- **Bessere Multi-Threading** Unterstützung
- **Moderne Shader-Sprache** (WGSL statt GLSL)

#### Migration Path in Three.js

```javascript
// WebGL (Alt)
import * as THREE from 'three';
const renderer = new THREE.WebGLRenderer();

// WebGPU (Neu)
import WebGPU from 'three/addons/capabilities/WebGPU.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

if (WebGPU.isAvailable()) {
  const renderer = new WebGPURenderer();
  await renderer.init();
} else {
  // Fallback zu WebGL
  const renderer = new THREE.WebGLRenderer();
}
```

#### TSL (Three.js Shading Language)

```javascript
import { uniform, texture, vec3, mix } from 'three/tsl';

// Moderne Shader-Definition
const myShader = {
  vertexNode: vec3(position),
  fragmentNode: mix(
    texture(map1),
    texture(map2),
    uniform('mixRatio')
  )
};
```

### Wann WebGPU nutzen?

✅ **Ja verwenden**:
- Große Particle Systems (100k+ Partikel)
- Echtzeit-Physics-Simulation
- Prozedurale Generation
- GPU-beschleunigte Berechnungen
- Projekte mit 6-12 Monaten Entwicklungszeit

❌ **Noch warten**:
- Universelle Browser-Unterstützung erforderlich
- Projekt rendert bereits mit 60 FPS in WebGL
- Mobile-First Projekt (begrenzte Unterstützung 2025)

---

## Fortgeschrittene Shader-Techniken

### 1. Subsurface Scattering (SSS)

#### Was ist SSS?
Lichtstreuung unter der Oberfläche - essentiell für realistische Haut, Wachs, Marmor, Blätter.

#### Fast SSS Approximation

```glsl
// Fragment Shader
uniform vec3 uLightPos;
uniform vec3 uThickness;
uniform vec3 uScatterColor;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLightPos - vPosition);
  vec3 viewDir = normalize(vViewPosition - vPosition);

  // Front lighting (standard)
  float NdotL = max(dot(normal, lightDir), 0.0);

  // Back lighting (translucency)
  vec3 backLightDir = normalize(vPosition - uLightPos);
  float backScatter = max(dot(normal, -backLightDir), 0.0);

  // Thickness-based attenuation
  float thickness = 1.0; // Oder aus Texture Map
  float scatter = exp(-thickness) * backScatter;

  // Combine
  vec3 diffuse = NdotL * vec3(1.0);
  vec3 sss = scatter * uScatterColor;

  gl_FragColor = vec4(diffuse + sss, 1.0);
}
```

#### Integration in Three.js

```javascript
import { SubsurfaceScatteringShader } from 'three/examples/jsm/shaders/SubsurfaceScatteringShader.js';

const material = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.clone(SubsurfaceScatteringShader.uniforms),
  vertexShader: SubsurfaceScatteringShader.vertexShader,
  fragmentShader: SubsurfaceScatteringShader.fragmentShader,
  lights: true
});

material.uniforms.thicknessMap.value = thicknessTexture;
material.uniforms.thicknessColor.value = new THREE.Color(0xff0000);
material.uniforms.thicknessDistortion.value = 0.1;
material.uniforms.thicknessAmbient.value = 0.4;
material.uniforms.thicknessAttenuation.value = 0.8;
material.uniforms.thicknessPower.value = 2.0;
material.uniforms.thicknessScale.value = 16.0;
```

---

### 2. Parallax Occlusion Mapping (POM)

#### Warum POM?
Erzeugt scheinbare 3D-Tiefe ohne zusätzliche Geometrie - extrem performant für detaillierte Oberflächen.

#### POM Shader Implementation

```glsl
// Fragment Shader
uniform sampler2D uHeightMap;
uniform float uHeightScale;
uniform int uMinLayers;
uniform int uMaxLayers;

varying vec2 vUv;
varying vec3 vViewDir;
varying vec3 vNormal;

vec2 parallaxOcclusionMapping(vec2 texCoords, vec3 viewDir) {
  // Anzahl der Layers basierend auf Betrachtungswinkel
  float numLayers = mix(float(uMaxLayers), float(uMinLayers), abs(dot(vec3(0.0, 0.0, 1.0), viewDir)));

  // Layer depth
  float layerDepth = 1.0 / numLayers;
  float currentLayerDepth = 0.0;

  // Verschiebung pro Layer
  vec2 P = viewDir.xy * uHeightScale;
  vec2 deltaTexCoords = P / numLayers;

  // Start values
  vec2 currentTexCoords = texCoords;
  float currentDepthMapValue = texture2D(uHeightMap, currentTexCoords).r;

  // Steep Parallax Mapping
  while(currentLayerDepth < currentDepthMapValue) {
    currentTexCoords -= deltaTexCoords;
    currentDepthMapValue = texture2D(uHeightMap, currentTexCoords).r;
    currentLayerDepth += layerDepth;
  }

  // Occlusion Interpolation für Smoothness
  vec2 prevTexCoords = currentTexCoords + deltaTexCoords;

  float afterDepth = currentDepthMapValue - currentLayerDepth;
  float beforeDepth = texture2D(uHeightMap, prevTexCoords).r - currentLayerDepth + layerDepth;

  float weight = afterDepth / (afterDepth - beforeDepth);
  vec2 finalTexCoords = mix(currentTexCoords, prevTexCoords, weight);

  return finalTexCoords;
}

void main() {
  vec3 viewDir = normalize(vViewDir);
  vec2 texCoords = parallaxOcclusionMapping(vUv, viewDir);

  // Discard außerhalb der Grenzen
  if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0) {
    discard;
  }

  vec3 color = texture2D(uDiffuseMap, texCoords).rgb;
  vec3 normal = texture2D(uNormalMap, texCoords).rgb;

  gl_FragColor = vec4(color, 1.0);
}
```

---

### 3. Atmospheric Scattering

#### Realistische Himmel & Sonnenuntergänge

```javascript
import { Sky } from 'three/examples/jsm/objects/Sky.js';

const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;

skyUniforms['turbidity'].value = 10;      // Atmosphärische Trübung
skyUniforms['rayleigh'].value = 3;        // Rayleigh-Streuung (Blau)
skyUniforms['mieCoefficient'].value = 0.005;  // Mie-Streuung (Haze)
skyUniforms['mieDirectionalG'].value = 0.7;   // Mie-Richtung

// Sonnenposition
const sun = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad(90 - 2);  // Elevation
const theta = THREE.MathUtils.degToRad(180);   // Azimuth

sun.setFromSphericalCoords(1, phi, theta);
skyUniforms['sunPosition'].value.copy(sun);

// Dynamischer Tag/Nacht-Zyklus
function updateSunPosition(time) {
  const elevation = THREE.MathUtils.lerp(-10, 90, Math.sin(time * 0.0001));
  const phi = THREE.MathUtils.degToRad(90 - elevation);

  sun.setFromSphericalCoords(1, phi, theta);
  skyUniforms['sunPosition'].value.copy(sun);

  // Update lighting
  directionalLight.position.copy(sun);
  directionalLight.intensity = THREE.MathUtils.clamp(elevation / 90, 0.1, 1.0);
}
```

---

### 4. Realistische Wasser-Shader mit Caustics

#### Ocean Shader mit FFT

```glsl
// Fragment Shader für realistisches Wasser
uniform float uTime;
uniform vec3 uLightDir;
uniform sampler2D uCausticsMap;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

// Gerstner Waves
vec3 gerstnerWave(vec2 pos, float wavelength, float amplitude, vec2 direction, float speed, float time) {
  float k = 2.0 * 3.14159 / wavelength;
  float c = sqrt(9.8 / k);
  vec2 d = normalize(direction);
  float f = k * (dot(d, pos) - c * time);
  float a = amplitude / k;

  return vec3(
    d.x * (a * cos(f)),
    a * sin(f),
    d.y * (a * cos(f))
  );
}

// Caustics Pattern
float caustics(vec3 pos, float time) {
  vec2 uv = pos.xz * 0.5;

  // Animated caustics lookup
  vec2 uv1 = uv + vec2(time * 0.03, time * 0.02);
  vec2 uv2 = uv + vec2(-time * 0.02, time * 0.04);

  float c1 = texture2D(uCausticsMap, uv1).r;
  float c2 = texture2D(uCausticsMap, uv2).r;

  return min(c1, c2);
}

void main() {
  // Water color
  vec3 waterColor = vec3(0.0, 0.3, 0.5);
  vec3 deepColor = vec3(0.0, 0.1, 0.2);

  // Fresnel for reflection
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

  // Caustics on sea floor
  float causticsStrength = caustics(vPosition, uTime);

  // Combine
  vec3 color = mix(deepColor, waterColor, fresnel);
  color += causticsStrength * 0.5;

  // Foam at wave peaks
  float foam = smoothstep(0.5, 0.9, vPosition.y);
  color = mix(color, vec3(1.0), foam);

  gl_FragColor = vec4(color, 0.9);
}
```

---

## GPU-Driven Rendering

### GPGPU Flow Field Particles

#### Setup mit WebGPU Compute Shaders

```javascript
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

const WIDTH = 512;
const PARTICLES = WIDTH * WIDTH;

// GPU Computation Renderer
const gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

// Position Texture
const dtPosition = gpuCompute.createTexture();
fillPositionTexture(dtPosition);

// Velocity Texture
const dtVelocity = gpuCompute.createTexture();
fillVelocityTexture(dtVelocity);

// Shaders
const positionVariable = gpuCompute.addVariable(
  'texturePosition',
  positionShader,
  dtPosition
);

const velocityVariable = gpuCompute.addVariable(
  'textureVelocity',
  velocityShader,
  dtVelocity
);

// Dependencies
gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);

// Uniforms
positionVariable.material.uniforms['time'] = { value: 0.0 };
velocityVariable.material.uniforms['time'] = { value: 0.0 };

gpuCompute.init();

// Animation Loop
function animate() {
  gpuCompute.compute();

  positionVariable.material.uniforms['time'].value = performance.now() * 0.001;

  // Use computed textures
  particleMaterial.uniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;

  renderer.render(scene, camera);
}
```

#### Position Update Shader

```glsl
// GPGPU Position Shader
uniform float time;
uniform float delta;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 tmpPos = texture2D(texturePosition, uv);
  vec3 position = tmpPos.xyz;

  vec4 tmpVel = texture2D(textureVelocity, uv);
  vec3 velocity = tmpVel.xyz;

  // Update position
  position += velocity * delta;

  // Boundaries
  if (position.x < -50.0 || position.x > 50.0) velocity.x *= -1.0;
  if (position.y < -50.0 || position.y > 50.0) velocity.y *= -1.0;
  if (position.z < -50.0 || position.z > 50.0) velocity.z *= -1.0;

  gl_FragColor = vec4(position, 1.0);
}
```

---

## Fotorealistische Rendering-Techniken

### 1. Path Tracing / Ray Tracing

#### WebGPU Path Tracer Setup

```javascript
import { PathTracingRenderer } from 'three-gpu-pathtracer';

const ptRenderer = new PathTracingRenderer(renderer);
ptRenderer.alpha = true;
ptRenderer.tiles.set(2, 2);

// Scene Setup
const material = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.1,
  metalness: 1.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05
});

// Enable path tracing
ptRenderer.camera = camera;
ptRenderer.material = material;

// Render
function render() {
  ptRenderer.update();

  if (ptRenderer.samples < 100) {
    requestAnimationFrame(render);
  }
}
```

---

### 2. Deferred Rendering Pipeline

```javascript
// Custom Deferred Rendering Setup
class DeferredRenderer {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    // G-Buffer Render Targets
    this.gBufferPosition = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: THREE.FloatType
    });

    this.gBufferNormal = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: THREE.FloatType
    });

    this.gBufferColor = new THREE.WebGLRenderTarget(width, height);

    // G-Buffer Material
    this.gBufferMaterial = new THREE.ShaderMaterial({
      vertexShader: gBufferVertexShader,
      fragmentShader: gBufferFragmentShader
    });

    // Lighting Pass Material
    this.lightingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tPosition: { value: this.gBufferPosition.texture },
        tNormal: { value: this.gBufferNormal.texture },
        tColor: { value: this.gBufferColor.texture },
        uLights: { value: [] }
      },
      vertexShader: lightingVertexShader,
      fragmentShader: lightingFragmentShader
    });

    this.lightingQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.lightingMaterial
    );
  }

  render() {
    // Geometry Pass
    this.scene.overrideMaterial = this.gBufferMaterial;
    this.renderer.setRenderTarget(this.gBufferPosition);
    this.renderer.render(this.scene, this.camera);

    // Lighting Pass
    this.scene.overrideMaterial = null;
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.lightingQuad, this.orthoCamera);
  }
}
```

---

## Fortgeschrittenes Post-Processing

### 1. Temporal Anti-Aliasing (TAA)

```javascript
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js';

const taaRenderPass = new TAARenderPass(scene, camera);
taaRenderPass.unbiased = false; // Performance
taaRenderPass.sampleLevel = 2;  // Quality (0-5)

composer.addPass(taaRenderPass);
```

---

### 2. Screen Space Ambient Occlusion (SSAO)

```javascript
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

const ssaoPass = new SSAOPass(scene, camera, width, height);

// Tuning Parameters
ssaoPass.kernelRadius = 16;        // AO Radius
ssaoPass.minDistance = 0.005;      // Min surface distance
ssaoPass.maxDistance = 0.1;        // Max AO distance
ssaoPass.output = SSAOPass.OUTPUT.Default;

composer.addPass(ssaoPass);
```

---

### 3. Ground Truth Ambient Occlusion (GTAO)

```glsl
// GTAO Shader (Advanced)
uniform sampler2D tDepth;
uniform sampler2D tNormal;
uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixInverse;

const int NUM_DIRECTIONS = 8;
const int NUM_STEPS = 4;

float gtao(vec2 uv, vec3 viewPos, vec3 viewNormal) {
  float occlusion = 0.0;
  float radius = 0.5;

  for (int i = 0; i < NUM_DIRECTIONS; i++) {
    float angle = (float(i) / float(NUM_DIRECTIONS)) * 2.0 * PI;
    vec2 direction = vec2(cos(angle), sin(angle));

    float horizonAngle = 0.0;

    for (int j = 0; j < NUM_STEPS; j++) {
      vec2 sampleUv = uv + direction * radius * float(j + 1) / float(NUM_STEPS);
      float sampleDepth = texture2D(tDepth, sampleUv).r;

      vec3 samplePos = reconstructPosition(sampleUv, sampleDepth);
      vec3 sampleDir = normalize(samplePos - viewPos);

      float elevationAngle = asin(dot(sampleDir, viewNormal));
      horizonAngle = max(horizonAngle, elevationAngle);
    }

    occlusion += 1.0 - sin(horizonAngle);
  }

  return occlusion / float(NUM_DIRECTIONS);
}
```

---

### 4. Order Independent Transparency (OIT)

```javascript
import { WeightedBlendedOIT } from 'three-wboit';

// Weighted Blended OIT Setup
const oitPass = new WeightedBlendedOIT(scene, camera, {
  samples: 4,
  bounds: 1.0
});

composer.addPass(oitPass);

// Materials müssen transparent sein
material.transparent = true;
material.depthWrite = false;
```

---

## Physics & Interaktivität

### Rapier Physics Integration (2025 Empfehlung)

```javascript
import RAPIER from '@dimforge/rapier3d-compat';

await RAPIER.init();

// World Setup
const gravity = { x: 0.0, y: -9.81, z: 0.0 };
const world = new RAPIER.World(gravity);

// Rigid Body
const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
  .setTranslation(0.0, 10.0, 0.0);
const rigidBody = world.createRigidBody(rigidBodyDesc);

// Collider
const colliderDesc = RAPIER.ColliderDesc.ball(0.5);
world.createCollider(colliderDesc, rigidBody);

// Sync mit Three.js
function updatePhysics(delta) {
  world.step();

  // Update Three.js mesh
  const position = rigidBody.translation();
  const rotation = rigidBody.rotation();

  mesh.position.copy(position);
  mesh.quaternion.copy(rotation);
}
```

---

## Mesh-Deformation & Animation

### Morph Targets / Blendshapes

```javascript
// Custom Morph Target Setup
const geometry = new THREE.BufferGeometry();

// Base position
const basePositions = new Float32Array([...]);
geometry.setAttribute('position', new THREE.BufferAttribute(basePositions, 3));

// Morph Target 1
const morphPositions1 = new Float32Array([...]);
geometry.morphAttributes.position = [];
geometry.morphAttributes.position[0] = new THREE.BufferAttribute(morphPositions1, 3);

// Morph Target 2
const morphPositions2 = new Float32Array([...]);
geometry.morphAttributes.position[1] = new THREE.BufferAttribute(morphPositions2, 2);

// Material
const material = new THREE.MeshStandardMaterial({
  morphTargets: true,
  morphNormals: true
});

const mesh = new THREE.Mesh(geometry, material);

// Animation
mesh.morphTargetInfluences[0] = 0.5; // 50% Blend
mesh.morphTargetInfluences[1] = 0.3; // 30% Blend
```

---

## Optimierung & Performance

### GPU Instancing mit Frustum Culling

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

const count = 10000;
const mesh = new THREE.InstancedMesh(geometry, material, count);

// Setup instances
const matrix = new THREE.Matrix4();
const positions = [];

for (let i = 0; i < count; i++) {
  matrix.setPosition(
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
    Math.random() * 100 - 50
  );
  mesh.setMatrixAt(i, matrix);

  positions.push(matrix.elements[12], matrix.elements[13], matrix.elements[14]);
}

scene.add(mesh);

// Custom Frustum Culling
const frustum = new THREE.Frustum();
const projScreenMatrix = new THREE.Matrix4();

function cullInstances() {
  camera.updateMatrixWorld();
  projScreenMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(projScreenMatrix);

  let visibleCount = 0;
  const tempVector = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    tempVector.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);

    if (frustum.containsPoint(tempVector)) {
      mesh.setColorAt(visibleCount, new THREE.Color(0x00ff00));
      visibleCount++;
    } else {
      mesh.setColorAt(i, new THREE.Color(0x000000));
    }
  }

  mesh.instanceColor.needsUpdate = true;
  mesh.count = visibleCount;
}
```

---

## Best Practices Zusammenfassung

### Performance Checklist

- [ ] **WebGPU** für Compute-intensive Tasks
- [ ] **GPGPU** für große Particle Systems
- [ ] **Instancing** für wiederholte Geometrie
- [ ] **Frustum Culling** implementiert
- [ ] **LOD** für komplexe Meshes
- [ ] **Texture Compression** (max 2048x2048)
- [ ] **Deferred Rendering** für viele Lichter
- [ ] **TAA** statt MSAA bei Post-Processing

### Visual Quality Checklist

- [ ] **Subsurface Scattering** für organische Materialien
- [ ] **POM** für detaillierte Oberflächen
- [ ] **Atmospheric Scattering** für realistische Himmel
- [ ] **SSAO/GTAO** für Ambient Occlusion
- [ ] **OIT** für korrekte Transparenz
- [ ] **Path Tracing** für ultimativen Realismus (statische Szenen)
- [ ] **Physics** für Interaktivität
- [ ] **Morph Targets** für Character Animation

---

## Empfohlene Reihenfolge zum Lernen

### Phase 1: Fundamentals (bereits in Hauptdokument)

### Phase 2: Intermediate Shaders
1. Atmospheric Scattering
2. Water mit Caustics
3. Subsurface Scattering

### Phase 3: Advanced Rendering
1. GPGPU Particles
2. Deferred Rendering
3. SSAO/GTAO

### Phase 4: Cutting Edge
1. WebGPU Migration
2. Path Tracing
3. Order Independent Transparency

---

## Ressourcen zu Advanced Topics

### WebGPU
- **WebGPU Fundamentals**: https://webgpufundamentals.org/
- **Toji's Best Practices**: https://toji.dev/webgpu-best-practices/

### GPGPU
- **Three.js Journey - GPGPU**: https://threejs-journey.com/lessons/gpgpu-flow-field-particles-shaders

### Path Tracing
- **three-gpu-pathtracer**: https://github.com/gkjohnson/three-gpu-pathtracer

### Physics
- **Rapier Docs**: https://rapier.rs/
- **react-three-rapier**: https://github.com/pmndrs/react-three-rapier

### Deferred Rendering
- **Threepipe**: https://threepipe.org/

---

**Diese Techniken sind das nächste Level. Meistere erst die Grundlagen aus dem Hauptdokument, dann komme hierher zurück!**

**Zuletzt aktualisiert**: Januar 2025
