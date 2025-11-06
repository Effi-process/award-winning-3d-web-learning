varying vec3 vPosition;
varying vec3 vNormal;
varying float vElevation;
varying vec3 vViewPosition;

void main() {
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  vElevation = position.y;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vViewPosition = viewPosition.xyz;

  gl_Position = projectionMatrix * viewPosition;
}
