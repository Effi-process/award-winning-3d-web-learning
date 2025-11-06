uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

// 3D Noise function for volumetric clouds
float random(vec3 st) {
  return fract(sin(dot(st.xyz, vec3(12.9898, 78.233, 45.5432))) * 43758.5453123);
}

float noise3D(vec3 st) {
  vec3 i = floor(st);
  vec3 f = fract(st);

  // 8 corners of cube
  float a = random(i);
  float b = random(i + vec3(1.0, 0.0, 0.0));
  float c = random(i + vec3(0.0, 1.0, 0.0));
  float d = random(i + vec3(1.0, 1.0, 0.0));
  float e = random(i + vec3(0.0, 0.0, 1.0));
  float f2 = random(i + vec3(1.0, 0.0, 1.0));
  float g = random(i + vec3(0.0, 1.0, 1.0));
  float h = random(i + vec3(1.0, 1.0, 1.0));

  vec3 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
    mix(mix(e, f2, u.x), mix(g, h, u.x), u.y),
    u.z
  );
}

// Fractal Brownian Motion for cloud detail
float fbm(vec3 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise3D(st * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

// Cloud density function
float cloudDensity(vec3 p) {
  // Animated position
  vec3 q = p + vec3(uTime * 0.02, uTime * 0.01, 0.0);

  // Base cloud shape
  float density = fbm(q * 0.5);

  // Add detail
  density += fbm(q * 2.0) * 0.3;

  // Edge fade
  float edgeFade = 1.0 - length(vPosition) * 0.5;
  edgeFade = smoothstep(0.0, 0.5, edgeFade);

  density *= edgeFade;

  // Threshold for cloud shape
  density = smoothstep(0.3, 0.7, density);

  return density;
}

void main() {
  // Calculate cloud density at this fragment
  float density = cloudDensity(vWorldPosition * 0.01);

  // Cloud color with subtle variation
  vec3 cloudColor = uColor;

  // Add depth variation
  float depthVariation = noise3D(vWorldPosition * 0.02 + uTime * 0.1);
  cloudColor = mix(cloudColor * 0.85, cloudColor, depthVariation);

  // Lighting
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
  float lightAmount = dot(vNormal, lightDir) * 0.5 + 0.5;

  cloudColor *= (0.7 + lightAmount * 0.3);

  // Soft edges
  float alpha = density * uOpacity;

  // Distance fade
  float distanceFade = 1.0 - smoothstep(300.0, 600.0, length(vViewPosition));
  alpha *= distanceFade;

  // Discard if too transparent
  if (alpha < 0.01) discard;

  gl_FragColor = vec4(cloudColor, alpha);
}
