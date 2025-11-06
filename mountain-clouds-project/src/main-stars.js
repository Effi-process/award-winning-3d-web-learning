import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

console.log('✨ Creating Beautiful Night Sky...');

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
camera.position.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000510, 1);

// ==========================================
// REALISTIC STAR FIELD SHADER
// ==========================================

const starVertexShader = `
  attribute float size;
  attribute float brightness;
  attribute vec3 color;

  varying float vBrightness;
  varying vec3 vColor;

  void main() {
    vBrightness = brightness;
    vColor = color;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = `
  varying float vBrightness;
  varying vec3 vColor;

  void main() {
    // Create circular star with soft glow
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    // Core star
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);

    // Bright center
    float core = 1.0 - smoothstep(0.0, 0.1, dist);

    // Glow around star
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    glow = pow(glow, 3.0) * 0.5;

    // Combine
    alpha = core + glow;
    alpha *= vBrightness;

    // Add slight color variation
    vec3 finalColor = vColor * (1.0 + core * 0.5);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Create realistic stars with varying properties
const starCount = 12000;
const positions = new Float32Array(starCount * 3);
const sizes = new Float32Array(starCount);
const brightness = new Float32Array(starCount);
const colors = new Float32Array(starCount * 3);

// Star color temperatures (realistic astronomical colors)
const starColors = [
  { temp: 'blue', color: new THREE.Color(0.7, 0.8, 1.0), weight: 0.1 },      // Hot blue stars
  { temp: 'white', color: new THREE.Color(1.0, 1.0, 1.0), weight: 0.5 },     // White stars (most common)
  { temp: 'yellow', color: new THREE.Color(1.0, 0.95, 0.8), weight: 0.25 },  // Yellow stars (like our sun)
  { temp: 'orange', color: new THREE.Color(1.0, 0.8, 0.6), weight: 0.1 },    // Orange stars
  { temp: 'red', color: new THREE.Color(1.0, 0.6, 0.4), weight: 0.05 }       // Cool red stars
];

function getStarColor() {
  const rand = Math.random();
  let cumulative = 0;

  for (const star of starColors) {
    cumulative += star.weight;
    if (rand < cumulative) {
      return star.color;
    }
  }
  return starColors[1].color; // default white
}

// Distribute stars realistically
for (let i = 0; i < starCount; i++) {
  // Spherical distribution for realistic sky
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const radius = 800 + Math.random() * 1500;

  positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = radius * Math.cos(phi);

  // Size variation - most stars small, few large
  const sizeRand = Math.pow(Math.random(), 3); // Power distribution for realism
  sizes[i] = sizeRand * 8 + 0.5;

  // Brightness with realistic distribution
  brightness[i] = Math.pow(Math.random(), 2) * 0.8 + 0.2;

  // Assign color
  const starColor = getStarColor();
  colors[i * 3] = starColor.r;
  colors[i * 3 + 1] = starColor.g;
  colors[i * 3 + 2] = starColor.b;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
starGeometry.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));
starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const starMaterial = new THREE.ShaderMaterial({
  vertexShader: starVertexShader,
  fragmentShader: starFragmentShader,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

console.log('✅ 12,000 realistic stars created');

// ==========================================
// MILKY WAY / NEBULA BACKGROUND
// ==========================================

const nebulaVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;

  // Noise function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

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

  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 6; i++) {
      value += amplitude * noise(st * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    // Create nebula-like clouds
    vec2 st = vUv * 3.0;

    float n1 = fbm(st + uTime * 0.01);
    float n2 = fbm(st * 1.5 - uTime * 0.008);
    float n3 = fbm(st * 2.0 + vec2(uTime * 0.005, -uTime * 0.007));

    // Combine noise layers
    float nebula = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    // Create darker and lighter regions
    nebula = pow(nebula, 2.0);

    // Milky way colors - deep blues and purples
    vec3 color1 = vec3(0.02, 0.03, 0.08);  // Deep blue
    vec3 color2 = vec3(0.05, 0.02, 0.1);   // Purple
    vec3 color3 = vec3(0.08, 0.05, 0.12);  // Lighter purple

    vec3 color = mix(color1, color2, nebula);
    color = mix(color, color3, pow(nebula, 2.0));

    // Fade at edges
    float vignette = 1.0 - length(vUv - 0.5) * 0.8;
    vignette = smoothstep(0.3, 1.0, vignette);

    color *= vignette;

    // Very subtle - just a hint of nebula
    float alpha = nebula * 0.3 * vignette;

    gl_FragColor = vec4(color, alpha);
  }
`;

// Create large sphere for nebula background
const nebulaSphere = new THREE.SphereGeometry(2000, 64, 64);
const nebulaMaterial = new THREE.ShaderMaterial({
  vertexShader: nebulaVertexShader,
  fragmentShader: nebulaFragmentShader,
  uniforms: {
    uTime: { value: 0 }
  },
  transparent: true,
  side: THREE.BackSide,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const nebula = new THREE.Mesh(nebulaSphere, nebulaMaterial);
scene.add(nebula);

console.log('✅ Nebula background created');

// ==========================================
// DISTANT STAR CLUSTERS
// ==========================================

function createStarCluster(x, y, z, count, spread) {
  const clusterGeometry = new THREE.BufferGeometry();
  const clusterPositions = new Float32Array(count * 3);
  const clusterSizes = new Float32Array(count);
  const clusterBrightness = new Float32Array(count);
  const clusterColors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    clusterPositions[i * 3] = x + (Math.random() - 0.5) * spread;
    clusterPositions[i * 3 + 1] = y + (Math.random() - 0.5) * spread;
    clusterPositions[i * 3 + 2] = z + (Math.random() - 0.5) * spread;

    clusterSizes[i] = Math.random() * 3 + 0.5;
    clusterBrightness[i] = Math.random() * 0.5 + 0.5;

    const color = getStarColor();
    clusterColors[i * 3] = color.r;
    clusterColors[i * 3 + 1] = color.g;
    clusterColors[i * 3 + 2] = color.b;
  }

  clusterGeometry.setAttribute('position', new THREE.BufferAttribute(clusterPositions, 3));
  clusterGeometry.setAttribute('size', new THREE.BufferAttribute(clusterSizes, 1));
  clusterGeometry.setAttribute('brightness', new THREE.BufferAttribute(clusterBrightness, 1));
  clusterGeometry.setAttribute('color', new THREE.BufferAttribute(clusterColors, 3));

  const clusterMaterial = new THREE.ShaderMaterial({
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Points(clusterGeometry, clusterMaterial);
}

// Add several star clusters
const clusters = [
  createStarCluster(400, 300, -1000, 200, 150),
  createStarCluster(-500, 200, -1200, 180, 120),
  createStarCluster(300, -400, -900, 150, 100),
  createStarCluster(-300, 500, -1100, 220, 180)
];

clusters.forEach(cluster => scene.add(cluster));

console.log('✅ Star clusters added');

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
// SCROLL ANIMATIONS
// ==========================================

const sections = document.querySelectorAll('.section');

sections.forEach((section, index) => {
  const title = section.querySelector('.title');
  const subtitle = section.querySelector('.subtitle');

  if (title) {
    gsap.to(title, {
      scrollTrigger: {
        trigger: section,
        start: 'top center',
        end: 'center center',
        scrub: 1
      },
      opacity: 1,
      y: 0
    });
  }

  if (subtitle) {
    gsap.to(subtitle, {
      scrollTrigger: {
        trigger: section,
        start: 'top center',
        end: 'center center',
        scrub: 1
      },
      opacity: 1,
      y: 0
    });
  }
});

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
const twinkleSpeed = new Float32Array(starCount);
const twinkleOffset = new Float32Array(starCount);

// Initialize twinkling
for (let i = 0; i < starCount; i++) {
  twinkleSpeed[i] = 0.5 + Math.random() * 2;
  twinkleOffset[i] = Math.random() * Math.PI * 2;
}

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Update nebula
  nebulaMaterial.uniforms.uTime.value = elapsed;

  // Minimal star twinkling - only very few stars
  const brightnessAttr = starGeometry.attributes.brightness;
  for (let i = 0; i < starCount; i++) {
    // Almost no twinkling
    if (Math.random() > 0.9995) { // Extremely rare twinkling
      const baseBrightness = brightness[i];
      const twinkle = Math.sin(elapsed * twinkleSpeed[i] + twinkleOffset[i]) * 0.1;
      brightnessAttr.array[i] = Math.max(0.1, baseBrightness + twinkle);
    }
  }
  brightnessAttr.needsUpdate = true;

  // Smooth mouse parallax
  mouse.x += (mouse.targetX - mouse.x) * 0.02;
  mouse.y += (mouse.targetY - mouse.y) * 0.02;

  // Rotate star field slightly with mouse
  stars.rotation.y = mouse.x * 0.05;
  stars.rotation.x = -mouse.y * 0.05;

  // Slow automatic rotation for depth
  stars.rotation.z += 0.0001;

  // Rotate nebula very slowly
  nebula.rotation.y += 0.00005;

  // Subtle cluster rotation
  clusters.forEach((cluster, i) => {
    cluster.rotation.y += 0.0002 * (i + 1);
    cluster.rotation.x += 0.0001 * (i + 1);
  });

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

console.log('✨ Beautiful Night Sky - Ready!');
