import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

console.log('🏔️ Starting Mountain & Clouds (Final Version)...');

// ==========================================
// SCENE SETUP
// ==========================================

const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xe8e8e8, 0.008);

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
renderer.setClearColor(0xe8e8e8, 1);

// ==========================================
// LIGHTING
// ==========================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 50);
scene.add(directionalLight);

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
  color: 0xcccccc,
  roughness: 0.9,
  metalness: 0.1
});

const mountainMesh = new THREE.Mesh(mountainGeometry, mountainMaterial);
scene.add(mountainMesh);

console.log('✅ Mountain created');

// ==========================================
// FLUFFY VOLUMETRIC CLOUDS WITH SHADERS
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

  // Simple 3D noise
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
    // Cloud density with animation
    vec3 pos = vWorldPosition * 0.01 + vec3(uTime * 0.02, uTime * 0.01, 0.0);
    float density = fbm(pos);

    // Soft edges - fade at boundaries
    float edgeFade = 1.0 - length(vPosition) * 0.5;
    edgeFade = smoothstep(0.0, 0.5, edgeFade);

    density *= edgeFade;
    density = smoothstep(0.3, 0.7, density);

    // Cloud color (white with slight blue tint)
    vec3 cloudColor = vec3(0.95, 0.96, 0.98);

    // Soft lighting
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float lightAmount = dot(vNormal, lightDir) * 0.3 + 0.7;
    cloudColor *= lightAmount;

    // Final alpha
    float alpha = density * uOpacity;

    // Very soft, fluffy look
    alpha *= 0.6;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(cloudColor, alpha);
  }
`;

// Create cloud layers
const cloudGroup = new THREE.Group();

function createFluffyCloud(y, zRange, scale, opacity) {
  // Use multiple deformed spheres for organic cloud shape
  const cloudPart = new THREE.Group();

  for (let j = 0; j < 5; j++) {
    const geometry = new THREE.SphereGeometry(
      20 + Math.random() * 30,
      24,
      24
    );

    // Deform geometry for organic look
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

// Create multiple cloud layers
const cloudLayers = [
  { count: 6, y: 100, zRange: [-50, 150], scale: 1.8, opacity: 0.35 },
  { count: 5, y: 70, zRange: [50, 250], scale: 2.0, opacity: 0.3 },
  { count: 4, y: 50, zRange: [150, 350], scale: 2.2, opacity: 0.25 }
];

cloudLayers.forEach(layer => {
  for (let i = 0; i < layer.count; i++) {
    const cloud = createFluffyCloud(layer.y, layer.zRange, layer.scale, layer.opacity);
    cloudGroup.add(cloud);
  }
});

scene.add(cloudGroup);

console.log('✅ Fluffy clouds created');

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

  // Update cloud shader uniforms
  cloudGroup.children.forEach((cloudPart, i) => {
    cloudPart.children.forEach(mesh => {
      if (mesh.material.uniforms) {
        mesh.material.uniforms.uTime.value = elapsed + i * 0.1;
      }
    });

    // Gentle drift
    cloudPart.position.x += Math.sin(elapsed * 0.05 + i) * 0.01;
    cloudPart.position.z += Math.cos(elapsed * 0.03 + i) * 0.005;
  });

  // Mouse follow
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  const originalPos = camera.position.clone();
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

console.log('🎉 Mountain & Clouds - Ready!');
