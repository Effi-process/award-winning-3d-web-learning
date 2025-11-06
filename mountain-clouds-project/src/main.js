import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Shaders
import mountainVertexShader from './shaders/mountain/vertex.glsl';
import mountainFragmentShader from './shaders/mountain/fragment.glsl';
import cloudsVertexShader from './shaders/clouds/vertex.glsl';
import cloudsFragmentShader from './shaders/clouds/fragment.glsl';

gsap.registerPlugin(ScrollTrigger);

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
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ==========================================
// LIGHTING
// ==========================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
scene.add(hemisphereLight);

// ==========================================
// PROCEDURAL MOUNTAIN
// ==========================================

class ProceduralMountain {
  constructor() {
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.create();
  }

  create() {
    // Base Geometry
    const geometry = new THREE.PlaneGeometry(400, 400, 256, 256);

    // Get position attribute
    const position = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    // Procedural height generation
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);

      // Multiple octaves of noise for realistic mountain
      let height = 0;
      let amplitude = 60;
      let frequency = 0.005;

      // Octave 1: Large mountains
      height += this.noise2D(vertex.x * frequency, vertex.y * frequency) * amplitude;

      // Octave 2: Medium details
      amplitude *= 0.5;
      frequency *= 2;
      height += this.noise2D(vertex.x * frequency, vertex.y * frequency) * amplitude;

      // Octave 3: Fine details (ridges)
      amplitude *= 0.5;
      frequency *= 3;
      height += this.noise2D(vertex.x * frequency, vertex.y * frequency) * amplitude;

      // Center peak
      const distFromCenter = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y);
      const centerPeak = Math.max(0, 100 - distFromCenter * 0.3);
      height += centerPeak;

      // Sharp peaks
      height = Math.pow(Math.abs(height) / 100, 1.3) * 100 * Math.sign(height);

      position.setZ(i, Math.max(height, 0));
    }

    geometry.computeVertexNormals();
    geometry.rotateX(-Math.PI / 2);

    // Material with shader
    this.material = new THREE.ShaderMaterial({
      vertexShader: mountainVertexShader,
      fragmentShader: mountainFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSnowLine: { value: 60.0 },
        uFogColor: { value: new THREE.Color(0xe8e8e8) },
        uFogNear: { value: 100.0 },
        uFogFar: { value: 600.0 }
      },
      side: THREE.DoubleSide,
      fog: true
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;

    this.geometry = geometry;
  }

  // Simple 2D noise (Perlin-like)
  noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;

    return this.lerp(v,
      this.lerp(u, this.grad2D(this.p[A], x, y), this.grad2D(this.p[B], x - 1, y)),
      this.lerp(u, this.grad2D(this.p[A + 1], x, y - 1), this.grad2D(this.p[B + 1], x - 1, y - 1))
    );
  }

  grad2D(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  // Permutation table for noise
  p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
    8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
    35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
    134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
    55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
    18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
    250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
    189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
    172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
    228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,
    107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
}

const mountain = new ProceduralMountain();
scene.add(mountain.mesh);

// ==========================================
// VOLUMETRIC CLOUDS
// ==========================================

class VolumetricClouds {
  constructor() {
    this.groups = [];
    this.createCloudLayers();
  }

  createCloudLayers() {
    // Multiple cloud layers at different heights and distances
    const layers = [
      { count: 8, y: 120, zRange: [-100, 200], scale: [80, 30, 80], opacity: 0.3 },
      { count: 6, y: 80, zRange: [50, 300], scale: [100, 25, 100], opacity: 0.25 },
      { count: 5, y: 50, zRange: [100, 400], scale: [120, 20, 120], opacity: 0.2 }
    ];

    layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const cloud = this.createCloud(layer);
        this.groups.push(cloud);
        scene.add(cloud);
      }
    });
  }

  createCloud(layer) {
    const geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);

    const material = new THREE.ShaderMaterial({
      vertexShader: cloudsVertexShader,
      fragmentShader: cloudsFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: layer.opacity },
        uColor: { value: new THREE.Color(0xffffff) }
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Random position
    mesh.position.set(
      (Math.random() - 0.5) * 400,
      layer.y + (Math.random() - 0.5) * 20,
      layer.zRange[0] + Math.random() * (layer.zRange[1] - layer.zRange[0])
    );

    // Random scale
    mesh.scale.set(
      layer.scale[0] + (Math.random() - 0.5) * 40,
      layer.scale[1] + (Math.random() - 0.5) * 10,
      layer.scale[2] + (Math.random() - 0.5) * 40
    );

    // Random rotation
    mesh.rotation.y = Math.random() * Math.PI * 2;

    return mesh;
  }

  update(time) {
    this.groups.forEach((cloud, i) => {
      cloud.material.uniforms.uTime.value = time + i * 0.1;

      // Gentle drift
      cloud.position.x += Math.sin(time * 0.1 + i) * 0.02;
      cloud.position.z += Math.cos(time * 0.05 + i) * 0.01;
    });
  }
}

const clouds = new VolumetricClouds();

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

// ==========================================
// SCROLL ANIMATIONS
// ==========================================

const sections = document.querySelectorAll('.section');

sections.forEach((section, index) => {
  const title = section.querySelector('.title');
  const subtitle = section.querySelector('.subtitle');

  // Text animations
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

  gsap.to(subtitle, {
    scrollTrigger: {
      trigger: section,
      start: 'top center',
      end: 'center center',
      scrub: 1
    },
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.2
  });

  // Camera movements per section
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

    lenis.scrollTo(targetSection, {
      duration: 2,
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    });
  });
});

// Update active dot on scroll
ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    const progress = self.progress;
    const sectionIndex = Math.floor(progress * sections.length);

    dots.forEach((dot, i) => {
      if (i === sectionIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
});

// ==========================================
// ANIMATION LOOP
// ==========================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Update mountain shader
  if (mountain.material.uniforms) {
    mountain.material.uniforms.uTime.value = elapsed;
  }

  // Update clouds
  clouds.update(elapsed);

  // Smooth mouse follow
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // Subtle camera rotation with mouse
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

window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('hidden');

    setTimeout(() => {
      loadingScreen.remove();
    }, 1000);
  }, 1000);
});

console.log('🏔️ Mountain & Clouds - Ready to Explore');
