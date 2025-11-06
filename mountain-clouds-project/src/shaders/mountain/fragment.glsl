uniform float uTime;
uniform float uSnowLine;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vElevation;
varying vec3 vViewPosition;

// Simple noise function
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

void main() {
  // Base rock color
  vec3 rockColor = vec3(0.4, 0.4, 0.45);

  // Rock texture variation
  float rockNoise = noise(vPosition.xz * 0.05);
  rockColor += vec3(rockNoise * 0.1);

  // Snow color
  vec3 snowColor = vec3(0.95, 0.95, 0.98);

  // Snow coverage based on elevation and slope
  float snowMix = smoothstep(uSnowLine - 10.0, uSnowLine + 10.0, vElevation);

  // Less snow on steep slopes
  float slope = abs(dot(vNormal, vec3(0.0, 1.0, 0.0)));
  snowMix *= smoothstep(0.3, 0.7, slope);

  // Add snow texture
  float snowNoise = noise(vPosition.xz * 0.2);
  snowColor += vec3(snowNoise * 0.05);

  // Final color blend
  vec3 finalColor = mix(rockColor, snowColor, snowMix);

  // Lighting
  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
  float diffuse = max(dot(vNormal, lightDir), 0.0);
  float ambient = 0.4;

  finalColor *= (ambient + diffuse * 0.6);

  // Atmospheric fog
  float fogDepth = length(vViewPosition);
  float fogFactor = smoothstep(uFogNear, uFogFar, fogDepth);
  finalColor = mix(finalColor, uFogColor, fogFactor);

  // Slight blue tint in shadows for realism
  vec3 shadowTint = vec3(0.7, 0.8, 0.9);
  finalColor = mix(finalColor, finalColor * shadowTint, (1.0 - diffuse) * 0.3);

  gl_FragColor = vec4(finalColor, 1.0);
}
