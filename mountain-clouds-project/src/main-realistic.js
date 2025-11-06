import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

console.log('✨ Creating Photorealistic Night Sky with Aurora...');

// ==========================================
// SCENE SETUP
// ==========================================

const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);
camera.position.set(0, 0, 0.1);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);

// ==========================================
// REALISTIC NIGHT SKY SHADER
// ==========================================

const skyVertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = normalize(worldPosition.xyz);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = `
  uniform float uTime;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  // Improved hash function
  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Improved 3D noise
  float noise3D(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    float n = p.x + p.y * 157.0 + 113.0 * p.z;
    return mix(
      mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
          mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
      mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
          mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
  }

  // Fractal Brownian Motion
  float fbm(vec3 p) {
    float f = 0.0;
    float amplitude = 0.5;
    for(int i = 0; i < 5; i++) {
      f += amplitude * noise3D(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return f;
  }

  // Better star function - creates circular stars with glow and spikes
  float stars(vec3 p, float threshold, out float starId) {
    vec3 cell = floor(p * 100.0);
    starId = hash(cell.x + cell.y * 157.0 + cell.z * 311.0);

    if(starId > threshold) {
      vec3 cellPos = fract(p * 100.0);
      vec2 offset = vec2(hash(starId + 123.0), hash(starId + 456.0));

      // Star position within cell
      vec2 starPos = offset * 0.6 + 0.2;
      vec2 delta = cellPos.xy - starPos;
      float dist = length(delta);

      // Core + glow
      float core = 1.0 - smoothstep(0.0, 0.01, dist);
      float glow = 1.0 - smoothstep(0.0, 0.08, dist);
      glow = pow(glow, 2.5);

      // Diffraction spikes (only for bright stars)
      float spikes = 0.0;
      if(starId > 0.999) {
        float angle = atan(delta.y, delta.x);
        float spike1 = abs(sin(angle * 2.0));  // 4-point star
        spike1 = pow(spike1, 20.0);
        spike1 *= 1.0 - smoothstep(0.0, 0.15, dist);

        spikes = spike1 * 0.3;
      }

      float intensity = core + glow * 0.4 + spikes;
      intensity *= pow((starId - threshold) / (1.0 - threshold), 2.5);

      return intensity;
    }
    return 0.0;
  }

  // Milky Way dust clouds
  float milkyWay(vec3 p) {
    // Create band across sky
    float band = abs(p.y);
    band = smoothstep(0.3, 0.0, band);

    // Add noise for cloud structure
    float dust = fbm(p * 2.0 + vec3(uTime * 0.01, 0.0, 0.0));
    dust = pow(dust, 2.0);

    return dust * band;
  }

  void main() {
    vec3 dir = normalize(vWorldPosition);

    // Night sky background gradient - darker to show aurora
    float atmosphere = smoothstep(-0.5, 0.5, dir.y);
    vec3 skyColor = mix(
      vec3(0.01, 0.015, 0.03),  // Horizon - dark blue
      vec3(0.002, 0.005, 0.015),  // Zenith - very dark blue
      atmosphere
    );

    // Add multiple star layers with different densities
    float starId1, starId2, starId3, starId4;
    float starLayer1 = stars(dir, 0.998, starId1);  // Bright stars
    float starLayer2 = stars(dir * 1.5, 0.9985, starId2);  // Medium stars
    float starLayer3 = stars(dir * 2.0, 0.999, starId3);  // Dim stars
    float starLayer4 = stars(dir * 3.0, 0.9995, starId4);  // Very dim background stars

    // Star colors - temperature-based with variation
    vec3 starColor1 = mix(vec3(1.0, 0.8, 0.6), vec3(0.6, 0.8, 1.0), starId1);
    vec3 starColor2 = mix(vec3(1.0, 0.95, 0.9), vec3(0.7, 0.85, 1.0), starId2);
    vec3 starColor3 = mix(vec3(0.9, 0.9, 1.0), vec3(1.0, 0.9, 0.8), starId3);
    vec3 starColor4 = vec3(0.8, 0.85, 1.0);

    // Add stars to sky with glow
    vec3 color = skyColor;
    color += starColor1 * starLayer1 * 3.0;
    color += starColor2 * starLayer2 * 2.0;
    color += starColor3 * starLayer3 * 1.2;
    color += starColor4 * starLayer4 * 0.6;

    // Add Milky Way
    float milky = milkyWay(dir);
    vec3 milkyColor = vec3(0.6, 0.65, 0.8) * 0.3;
    color += milkyColor * milky;

    // Subtle twinkling
    float twinkle = fbm(dir * 50.0 + uTime * 0.5) * 0.1;
    color += twinkle * 0.05;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Create sky sphere
const skyGeometry = new THREE.SphereGeometry(1800, 64, 64);
const skyMaterial = new THREE.ShaderMaterial({
  vertexShader: skyVertexShader,
  fragmentShader: skyFragmentShader,
  uniforms: {
    uTime: { value: 0 }
  },
  side: THREE.BackSide,
  depthWrite: false
});

const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

console.log('✅ Photorealistic night sky created');

// ==========================================
// REALISTIC AURORA BOREALIS
// Using noise subtraction and raymarching
// ==========================================

const auroraVertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const auroraFragmentShader = `
  uniform float uTime;
  uniform vec3 uCameraPosition;
  varying vec3 vWorldPosition;
  varying vec3 vPosition;
  varying vec2 vUv;

  // Hash functions
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // 2D Perlin noise
  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // FBM
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for(int i = 0; i < 6; i++) {
      value += amplitude * noise2D(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  // Key technique: Noise subtraction for aurora streaks
  float auroraPattern(vec2 uv, float time) {
    // Two noise layers with different scales and speeds
    float noise1 = fbm(uv * 1.5 + vec2(time * 0.1, 0.0));
    float noise2 = fbm(uv * 2.0 + vec2(-time * 0.08, time * 0.05));

    // Subtract and take absolute value - creates veiny pattern
    float pattern = abs(noise1 - noise2);

    // Much stronger contrast
    pattern = pow(pattern, 1.5);  // Less harsh than 3.0
    pattern *= 2.0;  // Boost intensity

    return pattern;
  }

  void main() {
    // Use world coordinates for aurora
    vec2 uv = vWorldPosition.xz * 0.002;

    // Vertical coordinate for height-based effects
    float height = vWorldPosition.y;

    // Base aurora pattern with noise subtraction
    float aurora = auroraPattern(uv, uTime);

    // Realistic vertical curtain structure
    // Aurora starts high and drops down in curtains
    float curtainShape = smoothstep(-100.0, 50.0, height) *
                         smoothstep(250.0, 100.0, height);

    // Add wavy bottom edge (like real aurora)
    float wavyEdge = fbm(vec2(uv.x * 8.0 + uTime * 0.15, 0.0)) * 30.0;
    curtainShape *= smoothstep(wavyEdge - 20.0, wavyEdge + 40.0, height);

    aurora *= curtainShape;

    // Vertical rays/streaks (characteristic of aurora)
    float rays = 0.0;
    for(float i = 0.0; i < 3.0; i += 1.0) {
      float rayX = uv.x * 10.0 + i * 2.3 + uTime * 0.1;
      float ray = abs(sin(rayX));
      ray = pow(ray, 12.0);
      ray *= fbm(vec2(rayX * 0.2, height * 0.01 + uTime * 0.3 + i));
      rays += ray;
    }
    aurora += rays * 0.4;

    // Realistic aurora colors - mostly green with hints of pink/purple at top
    vec3 greenColor = vec3(0.1, 1.0, 0.5);     // Aurora green
    vec3 yellowGreen = vec3(0.4, 1.0, 0.3);    // Yellow-green
    vec3 pinkTop = vec3(0.8, 0.2, 0.6);        // Pink/purple at top

    // Color based on height (green at bottom, pink at top)
    float heightGradient = smoothstep(50.0, 150.0, height);
    vec3 auroraColor = mix(greenColor, yellowGreen, fbm(uv * 2.0 + uTime * 0.03));
    auroraColor = mix(auroraColor, pinkTop, heightGradient * 0.7);

    // Add subtle color variation across width
    float colorShift = fbm(vec2(uv.x * 3.0 + uTime * 0.08, 0.5)) * 0.3;
    auroraColor = mix(auroraColor, vec3(0.2, 1.0, 0.8), colorShift);

    // Brightness flickering (like real aurora)
    float flicker = 0.7 + fbm(vec2(uTime * 2.0, uv.x * 5.0)) * 0.3;

    // Final intensity with realistic falloff
    float intensity = aurora * flicker * 0.8;

    // Edge fade for natural look
    float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
    intensity *= edgeFade;

    // Discard weak areas for better performance
    if(intensity < 0.01) discard;

    // Output with proper alpha for blending
    gl_FragColor = vec4(auroraColor, intensity * 0.7);
  }
`;

// Create aurora curtains with proper positioning
const auroraGroup = new THREE.Group();

function createAuroraCurtain(x, z, width, height, rotationY) {
  const geometry = new THREE.PlaneGeometry(width, height, 64, 64);

  // Add wave deformation
  const positions = geometry.attributes.position;
  for(let i = 0; i < positions.count; i++) {
    const px = positions.getX(i);
    const py = positions.getY(i);
    const wave = Math.sin(px * 0.02) * Math.cos(py * 0.01) * 10;
    positions.setZ(i, wave);
  }
  geometry.computeVertexNormals();

  const material = new THREE.ShaderMaterial({
    vertexShader: auroraVertexShader,
    fragmentShader: auroraFragmentShader,
    uniforms: {
      uTime: { value: Math.random() * 100 },
      uCameraPosition: { value: camera.position }
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, 100, z);  // Higher up like real aurora
  mesh.rotation.y = rotationY;
  mesh.rotation.x = -0.2;  // Slight tilt

  return mesh;
}

// Create realistic aurora curtains spread across the northern horizon
const auroraCurtains = [
  createAuroraCurtain(-600, -400, 800, 280, 0.2),
  createAuroraCurtain(-200, -450, 700, 300, 0.1),
  createAuroraCurtain(200, -380, 750, 290, -0.08),
  createAuroraCurtain(600, -420, 680, 270, -0.15),
  createAuroraCurtain(-400, -500, 650, 260, 0.18),
  createAuroraCurtain(0, -440, 720, 285, 0.0),
  createAuroraCurtain(400, -460, 700, 275, -0.12)
];

auroraCurtains.forEach(curtain => auroraGroup.add(curtain));
scene.add(auroraGroup);

console.log('✅ Realistic aurora borealis created');

// ==========================================
// SMOOTH SCROLL
// ==========================================

const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ==========================================
// MOUSE INTERACTION
// ==========================================

const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

window.addEventListener('mousemove', (event) => {
  mouse.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = (event.clientY / window.innerHeight - 0.5) * 2;
});

// ==========================================
// NAVIGATION
// ==========================================

const sections = document.querySelectorAll('.section');
const dots = document.querySelectorAll('.dot');

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const sectionIndex = parseInt(dot.dataset.section);
    lenis.scrollTo(sections[sectionIndex], { duration: 2 });
  });
});

ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    const sectionIndex = Math.min(Math.floor(self.progress * sections.length), sections.length - 1);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === sectionIndex);
    });
  }
});

// ==========================================
// ANIMATION LOOP
// ==========================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Update sky time
  skyMaterial.uniforms.uTime.value = elapsed;

  // Update aurora curtains
  auroraCurtains.forEach((curtain, i) => {
    curtain.material.uniforms.uTime.value = elapsed + i * 0.5;
    curtain.material.uniforms.uCameraPosition.value.copy(camera.position);

    // Gentle wave motion
    curtain.position.y = 100 + Math.sin(elapsed * 0.3 + i) * 5;
    curtain.rotation.y += Math.sin(elapsed * 0.1 + i) * 0.0003;
  });

  // Smooth mouse parallax
  mouse.x += (mouse.targetX - mouse.x) * 0.03;
  mouse.y += (mouse.targetY - mouse.y) * 0.03;

  // Rotate sky slightly with mouse
  camera.rotation.y = mouse.x * 0.1;
  camera.rotation.x = -mouse.y * 0.1;

  // Very slow sky rotation
  sky.rotation.y += 0.00005;

  renderer.render(scene, camera);
}

animate();

// ==========================================
// RESIZE
// ==========================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ==========================================
// LOADING
// ==========================================

setTimeout(() => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    setTimeout(() => loadingScreen.remove(), 1000);
  }
}, 500);

console.log('✨ Photorealistic Night Sky with Aurora - Ready!');
