import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

console.log('🌅 Creating Beautiful Sky...');

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

// ==========================================
// REALISTIC SKY GRADIENT SHADER
// ==========================================

const skyVertexShader = `
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = `
  uniform float uTime;
  uniform vec3 uSunPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  // Noise for atmospheric variation
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
    for (int i = 0; i < 6; i++) {
      value += amplitude * noise(st);
      st *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    // Vertical gradient (0 = bottom, 1 = top)
    float verticalGradient = vUv.y;

    // Atmospheric noise for variation
    float atmosphericNoise = fbm(vUv * 3.0 + uTime * 0.01) * 0.1;

    // Sky colors from the reference image
    // Horizon colors (bottom) - warm orange/pink/yellow
    vec3 horizonColor1 = vec3(1.0, 0.6, 0.4);    // Warm orange
    vec3 horizonColor2 = vec3(1.0, 0.75, 0.5);   // Peachy
    vec3 horizonColor3 = vec3(0.95, 0.85, 0.65); // Light yellow-orange

    // Mid sky - transition colors
    vec3 midColor1 = vec3(0.7, 0.8, 0.9);        // Light blue
    vec3 midColor2 = vec3(0.5, 0.7, 0.95);       // Sky blue

    // Upper sky - deeper blues
    vec3 skyColor1 = vec3(0.3, 0.5, 0.85);       // Medium blue
    vec3 skyColor2 = vec3(0.2, 0.4, 0.75);       // Deeper blue
    vec3 skyColor3 = vec3(0.15, 0.35, 0.7);      // Even deeper

    // Create smooth gradient with multiple color stops
    vec3 color;

    if (verticalGradient < 0.15) {
      // Bottom horizon - warm colors
      float t = verticalGradient / 0.15;
      color = mix(horizonColor1, horizonColor2, t);
    } else if (verticalGradient < 0.25) {
      // Transition from horizon to sky
      float t = (verticalGradient - 0.15) / 0.1;
      color = mix(horizonColor2, horizonColor3, t);
    } else if (verticalGradient < 0.35) {
      // Transition to light blue
      float t = (verticalGradient - 0.25) / 0.1;
      color = mix(horizonColor3, midColor1, t);
    } else if (verticalGradient < 0.5) {
      // Light blue to sky blue
      float t = (verticalGradient - 0.35) / 0.15;
      color = mix(midColor1, midColor2, t);
    } else if (verticalGradient < 0.7) {
      // Sky blue to medium blue
      float t = (verticalGradient - 0.5) / 0.2;
      color = mix(midColor2, skyColor1, t);
    } else if (verticalGradient < 0.85) {
      // Medium blue to deep blue
      float t = (verticalGradient - 0.7) / 0.15;
      color = mix(skyColor1, skyColor2, t);
    } else {
      // Deep blue at top
      float t = (verticalGradient - 0.85) / 0.15;
      color = mix(skyColor2, skyColor3, t);
    }

    // Add subtle atmospheric variation
    color += atmosphericNoise * 0.05;

    // Add slight horizontal variation for realism
    float horizontalVariation = fbm(vec2(vUv.x * 5.0, vUv.y * 2.0 + uTime * 0.005)) * 0.03;
    color += horizontalVariation;

    // Subtle vignette at edges
    float vignette = 1.0 - length(vUv - 0.5) * 0.3;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Create large sphere for sky
const skyGeometry = new THREE.SphereGeometry(1500, 64, 64);
const skyMaterial = new THREE.ShaderMaterial({
  vertexShader: skyVertexShader,
  fragmentShader: skyFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uSunPosition: { value: new THREE.Vector3(0, -0.3, -1) }
  },
  side: THREE.BackSide,
  depthWrite: false
});

const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

console.log('✅ Sky gradient created');

// ==========================================
// SUBTLE CLOUDS
// ==========================================

const cloudVertexShader = `
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const cloudFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

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

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise3D(st);
      st *= 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    // Cloud density
    vec3 pos = vWorldPosition * 0.002 + vec3(uTime * 0.01, 0.0, 0.0);
    float density = fbm(pos);

    // Make clouds wispy and subtle
    density = smoothstep(0.4, 0.7, density);

    // Fade at edges
    float edgeFade = 1.0 - length(vPosition) * 0.3;
    edgeFade = smoothstep(0.2, 0.8, edgeFade);

    density *= edgeFade;

    // Cloud color - bright white with slight warmth
    vec3 cloudColor = vec3(1.0, 0.98, 0.95);

    // Final alpha - very subtle
    float alpha = density * uOpacity * 0.4;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(cloudColor, alpha);
  }
`;

const cloudGroup = new THREE.Group();

function createSoftCloud(x, y, z, scale) {
  const cloudPart = new THREE.Group();

  // Create multiple soft spheres for each cloud
  for (let i = 0; i < 4; i++) {
    const geometry = new THREE.SphereGeometry(
      40 + Math.random() * 30,
      32,
      32
    );

    // Deform geometry
    const pos = geometry.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const px = pos.getX(j);
      const py = pos.getY(j);
      const pz = pos.getZ(j);

      const noise = Math.sin(px * 0.05) * Math.cos(py * 0.05) * Math.sin(pz * 0.05);
      pos.setX(j, px + noise * 8);
      pos.setY(j, py + noise * 8);
      pos.setZ(j, pz + noise * 8);
    }
    geometry.computeVertexNormals();

    const material = new THREE.ShaderMaterial({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      uniforms: {
        uTime: { value: Math.random() * 100 },
        uOpacity: { value: 1.0 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 100
    );
    cloudPart.add(mesh);
  }

  cloudPart.position.set(x, y, z);
  cloudPart.scale.set(scale, scale * 0.5, scale);

  return cloudPart;
}

// Create scattered clouds at different heights
const cloudLayers = [
  { x: -200, y: 100, z: -300, scale: 1.5 },
  { x: 150, y: 120, z: -400, scale: 1.8 },
  { x: -100, y: 80, z: -250, scale: 1.3 },
  { x: 250, y: 140, z: -500, scale: 2.0 },
  { x: 0, y: 90, z: -350, scale: 1.6 },
  { x: -300, y: 110, z: -450, scale: 1.7 },
  { x: 200, y: 70, z: -280, scale: 1.4 },
  { x: -150, y: 130, z: -380, scale: 1.9 }
];

cloudLayers.forEach(layer => {
  const cloud = createSoftCloud(layer.x, layer.y, layer.z, layer.scale);
  cloudGroup.add(cloud);
});

scene.add(cloudGroup);

console.log('✅ Soft clouds created');

// ==========================================
// SUN GLOW
// ==========================================

const sunGlowGeometry = new THREE.SphereGeometry(80, 32, 32);
const sunGlowMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      vec3 glowColor = vec3(1.0, 0.9, 0.7);
      gl_FragColor = vec4(glowColor, intensity * 0.8);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide
});

const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
sunGlow.position.set(300, -100, -800);
scene.add(sunGlow);

// Brighter sun core
const sunCoreGeometry = new THREE.SphereGeometry(40, 32, 32);
const sunCoreMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffee,
  transparent: true,
  opacity: 0.9
});
const sunCore = new THREE.Mesh(sunCoreGeometry, sunCoreMaterial);
sunCore.position.copy(sunGlow.position);
scene.add(sunCore);

console.log('✅ Sun glow added');

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

  // Update sky shader
  skyMaterial.uniforms.uTime.value = elapsed;

  // Animate clouds slowly
  cloudGroup.children.forEach((cloudPart, i) => {
    cloudPart.children.forEach(mesh => {
      if (mesh.material.uniforms) {
        mesh.material.uniforms.uTime.value = elapsed + i * 0.2;
      }
    });

    // Slow drift
    cloudPart.position.x += Math.sin(elapsed * 0.02 + i) * 0.02;
  });

  // Smooth mouse parallax
  mouse.x += (mouse.targetX - mouse.x) * 0.02;
  mouse.y += (mouse.targetY - mouse.y) * 0.02;

  // Subtle camera movement with mouse
  camera.rotation.y = mouse.x * 0.05;
  camera.rotation.x = -mouse.y * 0.05;

  // Subtle sun pulse
  sunGlow.scale.setScalar(1.0 + Math.sin(elapsed * 0.5) * 0.05);
  sunCore.scale.setScalar(1.0 + Math.sin(elapsed * 0.5) * 0.03);

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

console.log('🌅 Beautiful Sky - Ready!');
