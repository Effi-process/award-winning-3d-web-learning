import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

console.log('🏔️ Starting Mountain & Clouds...');

// ==========================================
// SCENE SETUP
// ==========================================

const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xe8e8e8, 0.008);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 80, 300);
camera.lookAt(0, 50, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xe8e8e8, 1);

console.log('✅ Scene, Camera, Renderer created');

// ==========================================
// LIGHTING
// ==========================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 50);
scene.add(directionalLight);

console.log('✅ Lights added');

// ==========================================
// SIMPLE MOUNTAIN (No Custom Shaders)
// ==========================================

const mountainGeometry = new THREE.PlaneGeometry(400, 400, 128, 128);
const position = mountainGeometry.attributes.position;

// Simple noise function
function simpleNoise(x, y) {
  return Math.sin(x * 0.01) * Math.cos(y * 0.01) * 50 +
         Math.sin(x * 0.02) * Math.cos(y * 0.02) * 25 +
         Math.sin(x * 0.05) * Math.cos(y * 0.05) * 10;
}

// Apply height
for (let i = 0; i < position.count; i++) {
  const x = position.getX(i);
  const y = position.getY(i);

  let height = simpleNoise(x, y);

  // Center peak
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
  metalness: 0.1,
  flatShading: false
});

const mountainMesh = new THREE.Mesh(mountainGeometry, mountainMaterial);
scene.add(mountainMesh);

console.log('✅ Mountain created');

// ==========================================
// SIMPLE CLOUDS (Spheres with transparency)
// ==========================================

const cloudGroup = new THREE.Group();

for (let i = 0; i < 15; i++) {
  const cloudGeometry = new THREE.SphereGeometry(
    30 + Math.random() * 40,
    16,
    16
  );

  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    roughness: 1.0,
    metalness: 0.0
  });

  const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

  cloud.position.set(
    (Math.random() - 0.5) * 400,
    60 + Math.random() * 60,
    -50 + Math.random() * 400
  );

  cloud.scale.set(
    1 + Math.random() * 0.5,
    0.6 + Math.random() * 0.3,
    1 + Math.random() * 0.5
  );

  cloudGroup.add(cloud);
}

scene.add(cloudGroup);

console.log('✅ Clouds created');

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

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

console.log('✅ Smooth scroll initialized');

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
      y: 0,
      duration: 1
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
      y: 0,
      duration: 1
    });
  }

  // Camera movement
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

console.log('✅ Scroll animations set up');

// ==========================================
// MOUSE INTERACTION
// ==========================================

const mouse = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
};

window.addEventListener('mousemove', (event) => {
  mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// ==========================================
// NAVIGATION DOTS
// ==========================================

const dots = document.querySelectorAll('.dot');

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const sectionIndex = parseInt(dot.dataset.section);
    const targetSection = sections[sectionIndex];

    if (targetSection) {
      lenis.scrollTo(targetSection, {
        duration: 2
      });
    }
  });
});

// Update active dot
ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    const progress = self.progress;
    const sectionIndex = Math.min(Math.floor(progress * sections.length), sections.length - 1);

    dots.forEach((dot, i) => {
      if (i === sectionIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
});

console.log('✅ Navigation set up');

// ==========================================
// ANIMATION LOOP
// ==========================================

const clock = new THREE.Clock();
let animationStarted = false;

function animate() {
  requestAnimationFrame(animate);

  if (!animationStarted) {
    console.log('✅ Animation loop started');
    animationStarted = true;
  }

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Animate clouds
  cloudGroup.children.forEach((cloud, i) => {
    cloud.position.x += Math.sin(elapsed * 0.1 + i) * 0.02;
    cloud.rotation.y += delta * 0.1;
  });

  // Mouse follow
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  camera.position.x += mouse.x * 0.5;
  camera.position.y += mouse.y * 0.5;

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

console.log('✅ Removing loading screen...');

setTimeout(() => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.remove();
      console.log('✅ Loading screen removed');
    }, 1000);
  }
}, 500);

console.log('🎉 Mountain & Clouds - Ready!');
