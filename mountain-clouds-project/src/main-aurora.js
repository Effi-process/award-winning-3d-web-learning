import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

console.log('🏔️ Starting Mountain & Clouds with Aurora...');

// ==========================================
// SCENE SETUP
// ==========================================

const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.005);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 80, 300);
camera.lookAt(0, 50, 0);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0a0a15, 1);

// ==========================================
// LIGHTING
// ==========================================

const ambientLight = new THREE.AmbientLight(0x4d5b9e, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x8899ff, 0.5);
directionalLight.position.set(50, 100, 50);
scene.add(directionalLight);

// Subtle aurora-colored rim light
const auroraLight = new THREE.PointLight(0x00ff88, 0.8, 500);
auroraLight.position.set(0, 150, 100);
scene.add(auroraLight);

// ==========================================
// MOUNTAIN
// ==========================================

const mountainGeometry = new THREE.PlaneGeometry(400, 400, 128, 128);
const position = mountainGeometry.attributes.position;

function simpleNoise(x, y) {
  return Math.sin(x * 0.01) * Math.cos(y * 0.01) * 50 +
         Math.sin(x * 0.02) * Math.cos(y * 0.02) * 25 +
         Math.sin(x * 0.05) * Math.cos(y * 0.05) * 10;
}

for (let i = 0; i < position.count; i++) {
  const x = position.getX(i);
  const y = position.getY(i);
  let height = simpleNoise(x, y);
  const dist = Math.sqrt(x * x + y * y);
  const peak = Math.max(0, 100 - dist * 0.3);
  height += peak;
  position.setZ(i, Math.max(height, 0));
}

mountainGeometry.computeVertexNormals();
mountainGeometry.rotateX(-Math.PI / 2);

const mountainMaterial = new THREE.MeshStandardMaterial({
  color: 0x2a2a40,
  roughness: 0.9,
  metalness: 0.1
});

const mountainMesh = new THREE.Mesh(mountainGeometry, mountainMaterial);
scene.add(mountainMesh);

console.log('✅ Mountain created');

// ==========================================
// AURORA BOREALIS SHADER
// ==========================================

const auroraVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vPosition = position;
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const auroraFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  // Noise functions
  float random(vec3 st) {
    return fract(sin(dot(st.xyz, vec3(12.9898, 78.233, 45.5432))) * 43758.5453123);
  }

  float noise3D(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);

    float a = random(i);
    float b = random(i + vec3(1.0, 0.0, 0.0));
    float c = random(i + vec3(0.0, 1.0, 0.0));
    float d = random(i + vec3(1.0, 1.0, 0.0));
    float e = random(i + vec3(0.0, 0.0, 1.0));
    float f1 = random(i + vec3(1.0, 0.0, 1.0));
    float g = random(i + vec3(0.0, 1.0, 1.0));
    float h = random(i + vec3(1.0, 1.0, 1.0));

    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
      mix(mix(e, f1, u.x), mix(g, h, u.x), u.y),
      u.z
    );
  }

  float fbm(vec3 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 6; i++) {
      value += amplitude * noise3D(st * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    // Create flowing aurora effect
    vec3 pos = vWorldPosition * 0.003;

    // Vertical waves
    float wave1 = fbm(vec3(pos.x + uTime * 0.1, pos.y * 2.0, pos.z + uTime * 0.05));
    float wave2 = fbm(vec3(pos.x - uTime * 0.08, pos.y * 1.5, pos.z - uTime * 0.03));

    // Combine waves for flowing curtain effect
    float density = wave1 * 0.6 + wave2 * 0.4;

    // Vertical gradient (stronger at top)
    float heightGradient = smoothstep(0.0, 1.0, vUv.y);
    density *= heightGradient;

    // Horizontal waves for curtain-like flow
    float curtainWave = sin(vUv.x * 8.0 + uTime * 0.5) * 0.3 + 0.7;
    density *= curtainWave;

    // Smooth density
    density = smoothstep(0.3, 0.8, density);

    // Aurora colors - green, cyan, purple gradient
    vec3 color1 = vec3(0.0, 1.0, 0.6);  // Bright green-cyan
    vec3 color2 = vec3(0.2, 0.8, 1.0);  // Cyan-blue
    vec3 color3 = vec3(0.6, 0.2, 1.0);  // Purple

    // Color mixing based on position and time
    float colorMix1 = fbm(vec3(vUv.x * 3.0, vUv.y * 2.0 + uTime * 0.05, uTime * 0.1));
    float colorMix2 = fbm(vec3(vUv.x * 2.0 - uTime * 0.03, vUv.y * 3.0, 0.0));

    vec3 auroraColor = mix(color1, color2, colorMix1);
    auroraColor = mix(auroraColor, color3, colorMix2 * 0.5);

    // Add bright shimmer
    float shimmer = fbm(vec3(vUv.x * 10.0 + uTime * 0.3, vUv.y * 10.0, uTime * 0.2));
    shimmer = pow(shimmer, 3.0) * 0.5;
    auroraColor += shimmer;

    // Soft edges
    float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
    density *= edgeFade;

    // Final alpha
    float alpha = density * uOpacity * 0.7;

    if (alpha < 0.02) discard;

    gl_FragColor = vec4(auroraColor, alpha);
  }
`;

// Create aurora curtains
const auroraGroup = new THREE.Group();

function createAuroraCurtain(x, z, width, height, rotation) {
  const geometry = new THREE.PlaneGeometry(width, height, 64, 64);

  // Wave the geometry
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const wave = Math.sin(px * 0.1) * Math.cos(py * 0.05) * 5;
    pos.setZ(i, wave);
  }
  geometry.computeVertexNormals();

  const material = new THREE.ShaderMaterial({
    vertexShader: auroraVertexShader,
    fragmentShader: auroraFragmentShader,
    uniforms: {
      uTime: { value: Math.random() * 100 },
      uOpacity: { value: 1.0 }
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, 120, z);
  mesh.rotation.y = rotation;

  return mesh;
}

// Create multiple aurora curtains
const auroraCurtains = [
  createAuroraCurtain(-150, 0, 250, 150, 0.3),
  createAuroraCurtain(50, 50, 200, 130, -0.2),
  createAuroraCurtain(100, -80, 280, 160, 0.15),
  createAuroraCurtain(-80, 100, 220, 140, -0.4),
];

auroraCurtains.forEach(curtain => auroraGroup.add(curtain));
scene.add(auroraGroup);

console.log('✅ Aurora Borealis created');

// ==========================================
// ENHANCED CLOUDS
// ==========================================

const cloudVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const cloudFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  float random(vec3 st) {
    return fract(sin(dot(st.xyz, vec3(12.9898, 78.233, 45.5432))) * 43758.5453123);
  }

  float noise3D(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);

    float a = random(i);
    float b = random(i + vec3(1.0, 0.0, 0.0));
    float c = random(i + vec3(0.0, 1.0, 0.0));
    float d = random(i + vec3(1.0, 1.0, 0.0));

    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec3 st) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise3D(st);
      st *= 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec3 pos = vWorldPosition * 0.01 + vec3(uTime * 0.02, uTime * 0.01, 0.0);
    float density = fbm(pos);

    float edgeFade = 1.0 - length(vPosition) * 0.5;
    edgeFade = smoothstep(0.0, 0.5, edgeFade);

    density *= edgeFade;
    density = smoothstep(0.3, 0.7, density);

    // Slightly blue-tinted clouds for night sky
    vec3 cloudColor = vec3(0.85, 0.88, 0.95);

    // Subtle aurora reflection on clouds
    vec3 auroraReflection = vec3(0.0, 0.3, 0.2) * 0.3;
    cloudColor += auroraReflection;

    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float lightAmount = dot(vNormal, lightDir) * 0.3 + 0.7;
    cloudColor *= lightAmount;

    float alpha = density * uOpacity * 0.5;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(cloudColor, alpha);
  }
`;

const cloudGroup = new THREE.Group();

function createFluffyCloud(y, zRange, scale, opacity) {
  const cloudPart = new THREE.Group();

  for (let j = 0; j < 5; j++) {
    const geometry = new THREE.SphereGeometry(
      20 + Math.random() * 30,
      24,
      24
    );

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.sin(z * 0.1);
      pos.setX(i, x + noise * 5);
      pos.setY(i, y + noise * 5);
      pos.setZ(i, z + noise * 5);
    }
    geometry.computeVertexNormals();

    const material = new THREE.ShaderMaterial({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      uniforms: {
        uTime: { value: Math.random() * 100 },
        uOpacity: { value: opacity }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 80
    );
    cloudPart.add(mesh);
  }

  cloudPart.position.set(
    (Math.random() - 0.5) * 400,
    y + (Math.random() - 0.5) * 20,
    zRange[0] + Math.random() * (zRange[1] - zRange[0])
  );

  cloudPart.scale.set(scale, scale * 0.6, scale);

  return cloudPart;
}

const cloudLayers = [
  { count: 6, y: 100, zRange: [-50, 150], scale: 1.8, opacity: 0.4 },
  { count: 5, y: 70, zRange: [50, 250], scale: 2.0, opacity: 0.35 },
  { count: 4, y: 50, zRange: [150, 350], scale: 2.2, opacity: 0.3 }
];

cloudLayers.forEach(layer => {
  for (let i = 0; i < layer.count; i++) {
    const cloud = createFluffyCloud(layer.y, layer.zRange, layer.scale, layer.opacity);
    cloudGroup.add(cloud);
  }
});

scene.add(cloudGroup);

console.log('✅ Enhanced clouds created');

// ==========================================
// STARS
// ==========================================

const starGeometry = new THREE.BufferGeometry();
const starCount = 3000;
const starPositions = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
  starPositions[i * 3] = (Math.random() - 0.5) * 2000;
  starPositions[i * 3 + 1] = Math.random() * 500 + 100;
  starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
  starSizes[i] = Math.random() * 2 + 0.5;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 2,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

console.log('✅ Stars added');

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

  gsap.to(camera.position, {
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 2
    },
    y: 80 - index * 20,
    z: 300 - index * 80,
    ease: 'none'
  });
});

// ==========================================
// MOUSE & NAVIGATION
// ==========================================

const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

window.addEventListener('mousemove', (event) => {
  mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
});

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

  // Animate aurora curtains
  auroraCurtains.forEach((curtain, i) => {
    if (curtain.material.uniforms) {
      curtain.material.uniforms.uTime.value = elapsed + i * 0.3;
    }

    // Gentle wave motion
    curtain.rotation.y += Math.sin(elapsed * 0.1 + i) * 0.0002;
    curtain.position.y = 120 + Math.sin(elapsed * 0.2 + i) * 3;
  });

  // Update cloud shader uniforms
  cloudGroup.children.forEach((cloudPart, i) => {
    cloudPart.children.forEach(mesh => {
      if (mesh.material.uniforms) {
        mesh.material.uniforms.uTime.value = elapsed + i * 0.1;
      }
    });

    cloudPart.position.x += Math.sin(elapsed * 0.05 + i) * 0.01;
    cloudPart.position.z += Math.cos(elapsed * 0.03 + i) * 0.005;
  });

  // Animate aurora light
  auroraLight.position.x = Math.sin(elapsed * 0.3) * 100;
  auroraLight.position.z = Math.cos(elapsed * 0.2) * 100;
  auroraLight.intensity = 0.6 + Math.sin(elapsed * 0.5) * 0.3;

  // Stars twinkle
  const sizes = starGeometry.attributes.size.array;
  for (let i = 0; i < starCount; i++) {
    sizes[i] = (Math.sin(elapsed * 2 + i) * 0.5 + 1.5) * (0.5 + Math.random() * 0.5);
  }
  starGeometry.attributes.size.needsUpdate = true;

  // Mouse follow
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  camera.position.x += mouse.x * 0.5;
  camera.position.y += mouse.y * 0.5;
  camera.lookAt(0, 50, 0);

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

console.log('🎉 Aurora Borealis - Ready!');
